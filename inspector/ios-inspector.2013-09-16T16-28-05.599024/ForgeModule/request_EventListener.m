#import "request_EventListener.h"

@implementation request_EventListener

//
// Here you can implement event listeners.
// These are functions which will get called when certain native events happen.
//

// The example below passes an event through to JavaScript when the application is resumed.
+ (void)applicationWillEnterForeground:(UIApplication *)application {
	// It is good practise to namespace any events you send to JavaScript with your module name
	[[ForgeApp sharedApp] event:@"request.resume" withParam:nil];
}

@end
