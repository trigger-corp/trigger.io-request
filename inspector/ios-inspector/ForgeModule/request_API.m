//
//  request_API.m
//  Forge
//
//  Created by Connor Dunn on 14/03/2012.
//  Copyright (c) 2012 Trigger Corp. All rights reserved.
//

#import "request_API.h"
#import "request_ProgressDelegate.h"
#import "request_EventListener.h"


@implementation request_API

/**
 * @deprecated This method is deprecated starting in module version 2.10 and platform version 2.6
 * @note Please use @code [requestAPI httpx:(ForgeTask*)task url:(NSString*)url] @endcode instead.
 */
+ (void)ajax:(ForgeTask*)task url:(NSString*)url {
    [request_API httpx:task url:url];
}


+ (void)httpx:(ForgeTask*)task url:(NSString*)url {
    NSDictionary *params = task.params;

    // Create request
    NSURL *urlObj = [NSURL URLWithString:url];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:urlObj];
    [request setHTTPMethod:[[params objectForKey:@"type"] uppercaseString]];
    [request setAllHTTPHeaderFields:[params objectForKey:@"headers"]];
    [request setTimeoutInterval:([((NSNumber*)[params objectForKey:@"timeout"]) floatValue] / 1000.0f)];

    // Create session
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSURLSession *session = nil;
    __block request_ProgressDelegate *delegate =  nil;
    if ([params objectForKey:@"progress"] && [params objectForKey:@"progress"] != [NSNull null]) {
        delegate = [[request_ProgressDelegate alloc] initWithTask:task];
        session = [NSURLSession sessionWithConfiguration:configuration delegate:delegate delegateQueue:[NSOperationQueue mainQueue]];
    } else {
        session = [NSURLSession sessionWithConfiguration:configuration];
    }

    // Set authorization header if requested
    if (([params objectForKey:@"username"] && [params objectForKey:@"username"] != [NSNull null]) || ([params objectForKey:@"password"] && [params objectForKey:@"password"] != [NSNull null])) {
        NSString *username = [params objectForKey:@"username"];
        NSString *password = [params objectForKey:@"password"];
        NSData *basicAuthCredentials = [[NSString stringWithFormat:@"%@:%@", username, password] dataUsingEncoding:NSUTF8StringEncoding];
        NSString *base64AuthCredentials = [NSString stringWithFormat:@"Basic %@", [basicAuthCredentials base64EncodedStringWithOptions:(NSDataBase64EncodingOptions)0]];
        [request addValue:base64AuthCredentials forHTTPHeaderField:@"Authorization"];
    }

    // Helper to process request once configuration is complete
    void (^sendRequest)(void) = ^() {
        NSURLSessionDataTask *client = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
            if (delegate != nil) {
                [delegate releaseDelegate];
            }

            // parse response
            long statusCode = 0;
            NSString *responseString = @"";
            NSDictionary *responseHeaders = [[NSDictionary alloc] init];
            if (![response isKindOfClass:[NSHTTPURLResponse class]]) {
                statusCode = 418;
                responseString = @"418 I'm a teapot (RFC 2324)";
            } else {
                statusCode = [(NSHTTPURLResponse *)response statusCode];
                responseHeaders = [(NSHTTPURLResponse *)response allHeaderFields];
                if (data != nil) {
                    responseString = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                }
            }

            // handle errors
            if (error != nil || statusCode < 200 || statusCode > 299) {
                NSMutableDictionary *errorObj = [[NSMutableDictionary alloc] init];
                [errorObj setValue:[@"HTTP error code received from server: " stringByAppendingString:[NSString stringWithFormat:@"%ld", statusCode]] forKey:@"message"];
                [errorObj setValue:@"EXPECTED_FAILURE" forKey:@"type"];
                [errorObj setValue:[NSString stringWithFormat:@"%ld", statusCode] forKey:@"statusCode"];
                [errorObj setValue:responseString forKey:@"content"];
                [errorObj setValue:responseHeaders forKey:@"headers"];
                [task error:errorObj];
                return;
            }

            [task success:@{@"response": responseString,
                            @"headers":  responseHeaders}];

        }];
        
        [client resume];
    };

    // Setup request parameters
    if ([params objectForKey:@"data"] && [params objectForKey:@"data"] != [NSNull null]) {
        NSMutableData *payload = [NSMutableData dataWithLength:0];
        [payload appendData:[[params objectForKey:@"data"] dataUsingEncoding:NSUTF8StringEncoding]];

        if ([params objectForKey:@"boundary"] && [params objectForKey:@"boundary"] != [NSNull null]) {
            if ([params objectForKey:@"files"] && [params objectForKey:@"files"] != [NSNull null]) {
                NSArray *scriptObjects = [params objectForKey:@"files"];

                unsigned long __block numfiles = [scriptObjects count];
                int index = -1;

                for (NSDictionary* scriptObject in scriptObjects) {
                    NSError *error = nil;
                    ForgeFile *forgeFile = [ForgeFile withScriptObject:scriptObject error:&error];
                    if (error != nil) {
                        [task error:[error localizedDescription] type:@"UNEXPECTED_FAILURE" subtype:nil];
                        return;
                    }

                    index++;
                    // Handle file
                    [forgeFile contents:^(NSData *raw) {
                        NSString *multipart_field_name = scriptObject[@"name"]
                            ? scriptObject[@"name"]
                            : [NSString stringWithFormat:@"%d", index];
                        NSString *multipart_filename = [forgeFile.resource lastPathComponent];
                        
                        // TODO [forgeFile.resource lastPathComponent]; // filename set by JS
                        /*NSString *specifiedFilename = [scriptObject objectForKey:@"filename"]; // filename set by JS
                        NSString *specifiedName = [scriptObject objectForKey:@"name"]; // name set by JS
                        BOOL videoUpload = [[[scriptObject objectForKey:@"type"] description] isEqualToString:@"video"];
                        if (specifiedFilename != nil) {
                            filename = specifiedFilename;
                        } else {
                            filename = videoUpload ? @"file.mov" : @"file.jpg";
                        }
                        if (specifiedName != nil &&
                            !( !videoUpload && [@"Image" isEqualToString:specifiedName] ) &&
                            !( videoUpload && [@"Video" isEqualToString:specifiedName] )) {
                            // name has been set by user
                            name = specifiedName;
                        }*/

                        @synchronized(task) {
                            [payload appendData:[@"--" dataUsingEncoding:NSUTF8StringEncoding]];
                            [payload appendData:[params[@"boundary"] dataUsingEncoding:NSUTF8StringEncoding]];
                            [payload appendData:[@"\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
                            [payload appendData:[@"Content-Disposition: form-data; " dataUsingEncoding:NSUTF8StringEncoding]];
                            [payload appendData:[[NSString stringWithFormat:@"name=\"%@\"; filename=\"%@\"\r\n", multipart_field_name, multipart_filename] dataUsingEncoding:NSUTF8StringEncoding]];
                            [payload appendData:[[NSString stringWithFormat:@"Content-Type: %@\r\n\r\n", forgeFile.mimeType]
                                                 dataUsingEncoding:NSUTF8StringEncoding]];
                            [payload appendData:raw];
                            [payload appendData:[@"\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
                            numfiles--;
                            if (numfiles == 0) {
                                [payload appendData:[@"--" dataUsingEncoding:NSUTF8StringEncoding]];
                                [payload appendData:[params[@"boundary"] dataUsingEncoding:NSUTF8StringEncoding]];
                                [payload appendData:[@"--\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
                                [request setHTTPBody:payload];
                                sendRequest();
                            }
                        }
                    } errorBlock:^(NSError *error) {
                        [task error:[error localizedDescription] type:@"EXPECTED_FAILURE" subtype:nil];
                    }];
                }

            } else {
                [task error:@"Forge error: Invalid parameters sent to request.ajax" type:@"BAD_INPUT" subtype:nil];
                return;
            }
        } else {
            [request setHTTPBody:payload];
            sendRequest();
        }
        
    } else if ([[params objectForKey:@"fileUploadMethod"] isEqualToString:@"raw"]) {
        NSMutableData *payload = [NSMutableData dataWithLength:0];
        NSArray *scriptObjects = [params objectForKey:@"files"];

        unsigned long __block numfiles = [scriptObjects count];

        for (NSDictionary* scriptObject in scriptObjects) {
            NSError *error = nil;
            ForgeFile *forgeFile = [ForgeFile withScriptObject:scriptObject error:&error];
            if (error != nil) {
                [task error:[error localizedDescription] type:@"UNEXPECTED_FAILURE" subtype:nil];
                return;
            }

            // Set Content-Type header if needed
            if (![[request allHTTPHeaderFields] objectForKey:@"Content-Type"]) {
                NSMutableDictionary *headersWithContentType = [[NSMutableDictionary alloc] initWithDictionary:[request allHTTPHeaderFields]];
                [headersWithContentType setValue:forgeFile.mimeType forKey:@"Content-Type"];
                [request setAllHTTPHeaderFields:headersWithContentType];
            }

            // Handle file
            [forgeFile contents:^(NSData *raw) {
                @synchronized(task) {
                    [payload appendData:raw];
                    numfiles--;
                    if (numfiles == 0) {
                        [request setHTTPBody:payload];
                        sendRequest();
                    }
                }
            } errorBlock:^(NSError *error) {
                [task error:[error localizedDescription] type:@"EXPECTED_FAILURE" subtype:nil];
            }];
        }
        
    } else {
        sendRequest();
    }
}

@end
