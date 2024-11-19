

import CoreBluetooth

@objc(CustomMethods)
class CustomMethods: NSObject, CBPeripheralManagerDelegate {
    var peripheralManager: CBPeripheralManager?

    override init() {
        super.init()
        self.peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
    }

    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        switch peripheral.state {
        case .poweredOff, .resetting, .unauthorized, .unsupported, .unknown:
            stopAdvertising()
        case .poweredOn:
          print("hello")
        @unknown default:
            fatalError()
        }
    }

   @objc func startAdvertising(_ deviceName: String) {
        let advertisementData: [String: Any] = [
            CBAdvertisementDataLocalNameKey: deviceName,
          CBAdvertisementDataServiceUUIDsKey: [CBUUID(string: "180D")]
        ]
        peripheralManager?.startAdvertising(advertisementData)
    }

    @objc func stopAdvertising() {
        peripheralManager?.stopAdvertising()
        peripheralManager?.removeAllServices()
    }
  

    func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveRead request: CBATTRequest) {
        // Handle read request
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveWrite requests: [CBATTRequest]) {
        // Handle write requests
    }
}

