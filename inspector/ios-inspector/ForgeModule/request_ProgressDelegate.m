//
//  request_ProgressDelegate.m
//  ForgeModule
//
//  Created by Antoine van Gelder on 2017/03/22.
//  Copyright © 2017 Trigger Corp. All rights reserved.
//

#import "request_ProgressDelegate.h"

@implementation request_ProgressDelegate

- (instancetype)initWithTask:(ForgeTask *)newTask {
    if (self = [super init]) {
        forgeTask = newTask;
        me = self; // "retain"
    }

    return self;
}

- (void) releaseDelegate {
    forgeTask = nil;
    me = nil;
}

- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task didSendBodyData:(int64_t)bytesSent totalBytesSent:(int64_t)totalBytesSent totalBytesExpectedToSend:(int64_t)totalBytesExpectedToSend {
    [[ForgeApp sharedApp] event:[NSString stringWithFormat:@"request.progress.%@", [forgeTask.params objectForKey:@"progress"]] withParam:@{@"total": [NSNumber numberWithLongLong:totalBytesExpectedToSend], @"done": [NSNumber numberWithLongLong:totalBytesSent]}];
}

@end
