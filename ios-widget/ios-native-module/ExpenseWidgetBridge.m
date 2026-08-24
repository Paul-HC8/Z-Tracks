#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ExpenseWidgetBridge, NSObject)

RCT_EXTERN_METHOD(updateTodayTotals:(nonnull NSNumber *)todayTotal
                  byCategory:(nonnull NSDictionary *)byCategory
                  lastAmount:(nonnull NSNumber *)lastAmount
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(drainPendingWidgetEntries:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

@end
