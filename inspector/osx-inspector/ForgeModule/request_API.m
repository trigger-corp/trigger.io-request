//
//  request_API.m
//  Forge
//
//  Created by Connor Dunn on 14/03/2012.
//  Copyright (c) 2012 Trigger Corp. All rights reserved.
//

#import "request_API.h"
#import <LRResty/LRResty.h>

typedef void (^Block)(LRRestyResponse *r);

@implementation request_API

+ (void)ajax:(ForgeTask*)task {
	NSDictionary* params = task.params;
	
	Block handler = ^ (LRRestyResponse *r) {
		// Response received
		if ([r status] >= 200 && [r status] < 400) {
			[task success:[r asString]];
		} else {
			NSMutableDictionary *errorObj = [[NSMutableDictionary alloc] init];
			[errorObj setValue:[@"HTTP error code received from server: " stringByAppendingString:[NSString stringWithFormat:@"%d", [r status]]] forKey:@"message"];
			[errorObj setValue:@"EXPECTED_FAILURE" forKey:@"type"];
			[errorObj setValue:[NSString stringWithFormat:@"%d", [r status]] forKey:@"statusCode"];
			[errorObj setValue:[r asString] forKey:@"content"];
			[task error:errorObj];
		}
	};
	@try {
		if ([@"POST" isEqualToString:[params objectForKey:@"type"]] || [@"PUT" isEqualToString:[params objectForKey:@"type"]]) {
			NSMutableData *payload = [NSMutableData dataWithLength:0];
			if ([params objectForKey:@"data"] && [params objectForKey:@"data"] != [NSNull null]) {
				[payload appendData:[[params objectForKey:@"data"] dataUsingEncoding:NSUTF8StringEncoding]];
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
									[payload appendData:[@"Content-Disposition: file; " dataUsingEncoding:NSUTF8StringEncoding]];
									[payload appendData:[[NSString stringWithFormat:@"name=\"%@\"; filename=\"%@\"\r\n", name, filename] dataUsingEncoding:NSUTF8StringEncoding]];
									[payload appendData:[[NSString stringWithFormat:@"Content-Type: %@\r\n\r\n", mimeType]
                                                         dataUsingEncoding:NSUTF8StringEncoding]];
									[payload appendData:raw];
									[payload appendData:[@"\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
									numfiles--;
									if (numfiles == 0) {
										// Call continue request
										[payload appendData:[@"--" dataUsingEncoding:NSUTF8StringEncoding]];
										[payload appendData:[[params objectForKey:@"boundary"] dataUsingEncoding:NSUTF8StringEncoding]];
										[payload appendData:[@"--\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
										LRRestyRequest *request = nil;
										if ([@"POST" isEqualToString:[params objectForKey:@"type"]]) {
											request = [[LRResty client] post:[params objectForKey:@"url"] payload:payload withBlock:handler];
										} else if ([@"PUT" isEqualToString:[params objectForKey:@"type"]]) {
											request = [[LRResty client] put:[params objectForKey:@"url"] payload:payload withBlock:handler];
										}
										[request setHeaders:[params objectForKey:@"headers"]];
										if ([params objectForKey:@"username"] && [params objectForKey:@"username"] != [NSNull null]) {
											[request setBasicAuthUsername:[params objectForKey:@"username"] password:[params objectForKey:@"password"] useCredentialSystem:NO];
										}
										
									}
								}
							} errorBlock:^(NSError *error) {
								[task error:[error localizedDescription] type:@"EXPECTED_FAILURE" subtype:nil];
							}];
						}
					} else {
						[task error:@"Forge error: Invalid parameters sent to request.ajax" type:@"BAD_INPUT" subtype:nil];
					}
				} else {
					LRRestyRequest *request = nil;
					if ([@"POST" isEqualToString:[params objectForKey:@"type"]]) {
						request = [[LRResty client] post:[params objectForKey:@"url"] payload:payload withBlock:handler];
					} else if ([@"PUT" isEqualToString:[params objectForKey:@"type"]]) {
						request = [[LRResty client] put:[params objectForKey:@"url"] payload:payload withBlock:handler];
					}
					[request setHeaders:[params objectForKey:@"headers"]];
					if ([params objectForKey:@"username"] && [params objectForKey:@"username"] != [NSNull null]) {
						[request setBasicAuthUsername:[params objectForKey:@"username"] password:[params objectForKey:@"password"] useCredentialSystem:NO];
					}
				}
			} else if ([params objectForKey:@"fileUploadMethod"] && [params objectForKey:@"fileUploadMethod"] != [NSNull null] && [[params objectForKey:@"fileUploadMethod"] isEqualToString:@"raw"]) {
				// Raw file upload
				
				if ([params objectForKey:@"files"] && [params objectForKey:@"files"] != [NSNull null]) {
					NSArray *files = [params objectForKey:@"files"];
					
					int __block numfiles = [files count];
					
					for (NSDictionary* file in files) {
						// Handle file
						[[[ForgeFile alloc] initWithFile:file] data:^(NSData *raw) {
							@synchronized(task) {
								[payload appendData:raw];
								numfiles--;
								if (numfiles == 0) {
									// Call continue request
									LRRestyRequest *request = nil;
									if ([@"POST" isEqualToString:[params objectForKey:@"type"]]) {
										request = [[LRResty client] post:[params objectForKey:@"url"] payload:payload withBlock:handler];
									} else if ([@"PUT" isEqualToString:[params objectForKey:@"type"]]) {
										request = [[LRResty client] put:[params objectForKey:@"url"] payload:payload withBlock:handler];
									}
									[request setHeaders:[params objectForKey:@"headers"]];
									if ([params objectForKey:@"username"] && [params objectForKey:@"username"] != [NSNull null]) {
										[request setBasicAuthUsername:[params objectForKey:@"username"] password:[params objectForKey:@"password"] useCredentialSystem:NO];
									}
								}
							}
						} errorBlock:^(NSError *error) {
							[task error:[error localizedDescription] type:@"EXPECTED_FAILURE" subtype:nil];
						}];
					}
				} else {
					[task error:@"Forge error: Invalid parameters sent to request.ajax" type: @"BAD_INPUT" subtype:nil];
				}				
			} else {
				[task error:@"Forge error: Invalid parameters sent to request.ajax (POST and PUT requests must have data or a raw file upload" type:@"BAD_INPUT" subtype:nil];
			}
		} else {
			LRRestyRequest *request = [[LRResty client] get:[params objectForKey:@"url"] withBlock:handler];
			[request setHeaders:[params objectForKey:@"headers"]];
			if ([params objectForKey:@"username"] && [params objectForKey:@"username"] != [NSNull null]) {
				[request setBasicAuthUsername:[params objectForKey:@"username"] password:[params objectForKey:@"password"] useCredentialSystem:NO];
			}
		}
	}
	@catch (NSException *exception) {
		[task error:@"Unknown error with request" type:@"UNEXPECTED_FAILURE" subtype:nil];
	}
}

@end
