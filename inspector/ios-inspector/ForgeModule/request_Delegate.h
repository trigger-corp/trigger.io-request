//
//  request_Delegate.h
//  ForgeModule
//
//  Created by Antoine van Gelder on 2017/03/22.
//  Copyright © 2017 Trigger Corp. All rights reserved.
//

#import <ForgeCore/ForgeCore.h>

@interface request_CookieStoreObserver : NSObject <WKHTTPCookieStoreObserver>
@end


@interface request_Delegate : NSObject <NSURLSessionDataDelegate, NSURLSessionTaskDelegate> {
    request_Delegate *me;
    ForgeTask *forgeTask;

    request_CookieStoreObserver *observer;
}

+ (instancetype)withTask:(ForgeTask*)task;
- (void) releaseDelegate;

+ (void) saveCookiesFromResponse:(NSHTTPURLResponse*)response;

@end
