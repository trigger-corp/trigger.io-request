//
//  request_ProgressDelegate.h
//  ForgeModule
//
//  Created by Antoine van Gelder on 2017/03/22.
//  Copyright © 2017 Trigger Corp. All rights reserved.
//

#import <ForgeCore/ForgeCore.h>

@interface request_ProgressDelegate :  NSObject <NSURLSessionDataDelegate> {
    ForgeTask *forgeTask;
    request_ProgressDelegate *me;
}

- (instancetype)initWithTask:(ForgeTask*)newTask;
- (void) releaseDelegate;

@end
