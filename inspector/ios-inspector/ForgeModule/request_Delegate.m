//
//  request_Delegate.m
//  ForgeModule
//
//  Created by Antoine van Gelder on 2017/03/22.
//  Copyright © 2017 Trigger Corp. All rights reserved.
//

#import "request_Delegate.h"


@implementation request_CookieStoreObserver

- (void)cookiesDidChangeInCookieStore:(WKHTTPCookieStore *)cookieStore {
    //NSLog(@"request_CookieStoreObserver:cookiesDidChangeInCookieStore");
}

@end


@implementation request_Delegate

#pragma mark Lifecycle

+ (instancetype) withTask:(ForgeTask*)task {
    request_Delegate *delegate = [[self alloc] init];
    if (delegate) {
        delegate->me = delegate; // "retain"
        delegate->forgeTask = task;

        delegate->observer = [[request_CookieStoreObserver alloc] init];
        WKHTTPCookieStore *cookieStore = ForgeApp.sharedApp.webView.configuration.websiteDataStore.httpCookieStore;
        [cookieStore addObserver:delegate->observer];
    }

    return delegate;
}

- (void) releaseDelegate {
    WKHTTPCookieStore *cookieStore = ForgeApp.sharedApp.webView.configuration.websiteDataStore.httpCookieStore;
    [cookieStore removeObserver:self->observer];
    self->forgeTask = nil;
    self->me = nil;
}


#pragma mark NSURLSessionDataDelegate

- (void) URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task didSendBodyData:(int64_t)bytesSent totalBytesSent:(int64_t)totalBytesSent totalBytesExpectedToSend:(int64_t)totalBytesExpectedToSend {

    if (self->forgeTask.params[@"progress"] && self->forgeTask.params[@"progress"] != [NSNull null]) {
        NSString *progressId = self->forgeTask.params[@"progress"];
        NSString *event = [NSString stringWithFormat:@"request.progress.%@", progressId];
        [[ForgeApp sharedApp] event:event withParam:@{
            @"total": [NSNumber numberWithLongLong:totalBytesExpectedToSend],
            @"done":  [NSNumber numberWithLongLong:totalBytesSent]
        }];
    }
}


#pragma mark NSURLSessionTaskDelegate

- (void) URLSession:(NSURLSession*)session task:(NSURLSessionTask*)task willPerformHTTPRedirection:(NSHTTPURLResponse*)response newRequest:(NSURLRequest*)request completionHandler:(void (^)(NSURLRequest*))completionHandler {

    if ([response isKindOfClass:[NSHTTPURLResponse class]]) {
        [request_Delegate saveCookiesFromResponse:(NSHTTPURLResponse*)response];
    }

    completionHandler(request);
}


#pragma mark Helpers

+ (void) saveCookiesFromResponse:(NSHTTPURLResponse*)response {
    WKHTTPCookieStore *cookieStore = ForgeApp.sharedApp.webView.configuration.websiteDataStore.httpCookieStore;
    NSArray<NSHTTPCookie*> *cookies = [NSHTTPCookie cookiesWithResponseHeaderFields:response.allHeaderFields forURL:response.URL];
    for (NSHTTPCookie *cookie in cookies) {
        [cookieStore setCookie:cookie completionHandler:^{
            NSLog(@"Set cookie: %@", cookie);
        }];
    }
}

@end
