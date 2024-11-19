#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
@interface RCT_EXTERN_MODULE(CustomMethods, NSObject)
// Expose the method to React Native
RCT_EXTERN_METHOD(startAdvertising:(NSString *)deviceName)
RCT_EXTERN_METHOD(stopAdvertising)

@end
