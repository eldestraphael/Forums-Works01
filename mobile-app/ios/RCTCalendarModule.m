// RCTCalendarModule.m
#import "RCTCalendarModule.h"
@implementation RCTCalendarModule

RCT_EXPORT_METHOD(createCalendarEvent:(NSString *)name location:(NSString *)location)
{
  NSLog(@"Something To Print");
}

// To export a module named RCTCalendarModule
RCT_EXPORT_MODULE();

@end
