//
//  request_API.m
//  Forge
//
//  Created by Connor Dunn on 14/03/2012.
//  Copyright (c) 2012 Trigger Corp. All rights reserved.
//

#import "request_API.h"
#import "AFNetworking.h"


@implementation request_API

+ (void)ajax:(ForgeTask*)task url:(NSString*)url {
	NSDictionary* params = task.params;
	
	NSURL *urlObj = [NSURL URLWithString:url];
	NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:urlObj];
	
	[request setHTTPMethod:[[params objectForKey:@"type"] uppercaseString]];
	[request setAllHTTPHeaderFields:[params objectForKey:@"headers"]];
	[request setTimeoutInterval:([((NSNumber*)[params objectForKey:@"timeout"]) floatValue] / 1000.0f)];
	
	AFHTTPRequestOperation *operation = [[AFHTTPRequestOperation alloc] initWithRequest:request];
	
	[operation setCompletionBlockWithSuccess:^(AFHTTPRequestOperation *operation, id responseObject) {
		[task success:[operation responseString]];
	} failure:^(AFHTTPRequestOperation *operation, NSError *error) {
		NSMutableDictionary *errorObj = [[NSMutableDictionary alloc] init];
		int statusCode = [[operation response] statusCode];
		[errorObj setValue:[@"HTTP error code received from server: " stringByAppendingString:[NSString stringWithFormat:@"%d", statusCode]] forKey:@"message"];
		[errorObj setValue:@"EXPECTED_FAILURE" forKey:@"type"];
		[errorObj setValue:[NSString stringWithFormat:@"%d", statusCode] forKey:@"statusCode"];
		[errorObj setValue:[operation responseString] forKey:@"content"];
		[task error:errorObj];
	}];
	
	if ([params objectForKey:@"progress"] && [params objectForKey:@"progress"] != [NSNull null]) {
		[operation setUploadProgressBlock:^(NSUInteger bytesWritten, long long totalBytesWritten, long long totalBytesExpectedToWrite) {
			[[ForgeApp sharedApp] event:[NSString stringWithFormat:@"request.progress.%@", [params objectForKey:@"progress"]] withParam:@{@"total": [NSNumber numberWithLongLong:totalBytesExpectedToWrite], @"done": [NSNumber numberWithLongLong:totalBytesWritten]}];
		}];
	}
	
	AFHTTPClient *client = [AFHTTPClient clientWithBaseURL:urlObj];
	
	if (([params objectForKey:@"username"] && [params objectForKey:@"username"] != [NSNull null]) || ([params objectForKey:@"password"] && [params objectForKey:@"password"] != [NSNull null])) {
		[client setAuthorizationHeaderWithUsername:[params objectForKey:@"username"] password:[params objectForKey:@"password"]];
	}
	
	void (^sendRequest)() = ^() {
		[client enqueueHTTPRequestOperation:operation];
	};
	[ForgeLog i:@"------------------------------"];
	[ForgeLog i:params];
	if ([params objectForKey:@"data"] && [params objectForKey:@"data"] != [NSNull null]) {
		NSMutableData *payload = [NSMutableData dataWithLength:0];
		[ForgeLog i:payload];
		[payload appendData:[[params objectForKey:@"data"] dataUsingEncoding:NSUTF8StringEncoding]];
		[ForgeLog i:payload];
		
		if ([params objectForKey:@"boundary"] && [params objectForKey:@"boundary"] != [NSNull null]) {
			if ([params objectForKey:@"files"] && [params objectForKey:@"files"] != [NSNull null]) {
				NSArray *files = [params objectForKey:@"files"];
				
				int __block numfiles = [files count];
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
								[ForgeLog i:payload];
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
			[ForgeLog i:payload];
			[request setHTTPBody:payload];
			sendRequest();
		}
	} else if ([[params objectForKey:@"fileUploadMethod"] isEqualToString:@"raw"]) {
		NSMutableData *payload = [NSMutableData dataWithLength:0];
		NSArray *files = [params objectForKey:@"files"];
		
		int __block numfiles = [files count];
		
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
