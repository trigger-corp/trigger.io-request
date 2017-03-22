//
//  request_API.m
//  Forge
//
//  Created by Connor Dunn on 14/03/2012.
//  Copyright (c) 2012 Trigger Corp. All rights reserved.
//

#import "request_API.h"
#import "request_ProgressDelegate.h"


@implementation request_API

+ (void)ajax:(ForgeTask*)task url:(NSString*)url {
	NSDictionary* params = task.params;

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
	void (^sendRequest)() = ^() {
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
				NSArray *files = [params objectForKey:@"files"];
				
				unsigned long __block numfiles = [files count];
				int index = -1;
				
				for (NSDictionary* file in files) {
					index++;
					// Handle file
					[[[ForgeFile alloc] initWithFile:file] data:^(NSData *raw) {
						NSString *filename; // multipart filename
						NSString *name = [NSString stringWithFormat:@"%d", index]; // multipart field name
						NSString *specifiedFilename = [file objectForKey:@"filename"]; // filename set by JS
						NSString *specifiedName = [file objectForKey:@"name"]; // name set by JS
						BOOL videoUpload = [[[file objectForKey:@"type"] description] isEqualToString:@"video"];
						
						if (specifiedFilename != nil) {
							filename = specifiedFilename;
						} else {
							filename = videoUpload? @"file.mov": @"file.jpg";
						}
						
						if (specifiedName != nil &&
							!( !videoUpload && [@"Image" isEqualToString:specifiedName] ) &&
							!( videoUpload && [@"Video" isEqualToString:specifiedName] )) {
							// name has been set by user
							name = specifiedName;
						}
						
						NSString *mimeType;
						if ([[[file objectForKey:@"type"] description] isEqualToString:@"video"]) {
							mimeType = @"video/quicktime";
						} else {
							mimeType = @"image/jpg";
						}
						
						@synchronized(task) {
							[payload appendData:[@"--" dataUsingEncoding:NSUTF8StringEncoding]];
							[payload appendData:[[params objectForKey:@"boundary"] dataUsingEncoding:NSUTF8StringEncoding]];
							[payload appendData:[@"\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
							[payload appendData:[@"Content-Disposition: form-data; " dataUsingEncoding:NSUTF8StringEncoding]];
							[payload appendData:[[NSString stringWithFormat:@"name=\"%@\"; filename=\"%@\"\r\n", name, filename] dataUsingEncoding:NSUTF8StringEncoding]];
							[payload appendData:[[NSString stringWithFormat:@"Content-Type: %@\r\n\r\n", mimeType]
												 dataUsingEncoding:NSUTF8StringEncoding]];
							[payload appendData:raw];
							[payload appendData:[@"\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
							numfiles--;
							if (numfiles == 0) {
								[payload appendData:[@"--" dataUsingEncoding:NSUTF8StringEncoding]];
								[payload appendData:[[params objectForKey:@"boundary"] dataUsingEncoding:NSUTF8StringEncoding]];
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
		NSArray *files = [params objectForKey:@"files"];
		
		unsigned long __block numfiles = [files count];
		
		for (NSDictionary* file in files) {
			// Handle file
			[[[ForgeFile alloc] initWithFile:file] data:^(NSData *raw) {
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
