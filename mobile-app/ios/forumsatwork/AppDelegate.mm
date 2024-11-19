#import "AppDelegate.h"
#import <Firebase.h>

#import <React/RCTBundleURLProvider.h>
// #import <GNSMessages.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTRootView.h>
#import <React/RCTBridge.h>
#import <React/RCTViewManager.h>

// @interface AppDelegate()

// @property(nonatomic) GNSPermission *nearbyPermission;
// @property(nonatomic) GNSMessageManager *messageMgr;
// @property(nonatomic) id<GNSPublication> publication;
// @property(nonatomic) id<GNSSubscription> subscription;
// @end

 

 


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  self.moduleName = @"forumsatwork";
  // RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

  // RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"TestModule" initialProperties:nil];
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


// RCT_EXPORT_MODULE();

// - (NSArray<NSString *> *)supportedEvents {
//   return @[@"onMessageFound", @"onMessageLost"];
// }

// RCT_EXPORT_METHOD(startPublishing:(NSString *)message) {
//   self.messageMgr = [[GNSMessageManager alloc] initWithAPIKey:@"AIzaSyDv8C3HwD9Lzyal30hAfbROnqrrAEuSsOA"];
//   self.publication = [self.messageMgr publicationWithMessage:[GNSMessage messageWithContent:[message dataUsingEncoding:NSUTF8StringEncoding]]];
// }

//RCT_EXPORT_METHOD(startSubscribing) {
//  __weak __typeof__(self) weakSelf = self;
//  self.subscription = [self.messageMgr subscriptionWithMessageFoundHandler:^(GNSMessage *message) {
//    [weakSelf sendEventWithName:@"onMessageFound" body:@{@"message": [[NSString alloc] initWithData:message.content encoding:NSUTF8StringEncoding]}];
//  } messageLostHandler:^(GNSMessage *message) {
//    [weakSelf sendEventWithName:@"onMessageLost" body:@{@"message": [[NSString alloc] initWithData:message.content encoding:NSUTF8StringEncoding]}];
//  }];
//}



@end
