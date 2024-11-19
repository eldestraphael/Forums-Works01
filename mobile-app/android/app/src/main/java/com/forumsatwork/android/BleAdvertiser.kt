package com.forumsatwork.android
import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.AdvertisingSet
import android.bluetooth.le.AdvertisingSetCallback
import android.bluetooth.le.AdvertisingSetParameters
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.ActivityCompat
import androidx.core.content.PackageManagerCompat.LOG_TAG
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule


class BleAdvertiser(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val TAG = "BleAdvertiser"
    private val bluetoothAdapter: BluetoothAdapter?
    private var currentAdvertisingSet: AdvertisingSet? = null
    private var callback: AdvertisingSetCallback? = null
    init {
        val bluetoothManager = reactContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        bluetoothAdapter = bluetoothManager.adapter
    }

    override fun getName(): String {
        return "BleAdvertiser"
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @ReactMethod
    fun startAdvertising(bluetoothName: String) {
        sendEvent("onAdvertiseError", "Bluetooth advertise permission is not granted")
        val context = reactApplicationContext
        Log.e(TAG," started")
        if (bluetoothAdapter == null) {
            Log.e(TAG, "Bluetooth is not enabled")
            sendEvent("onAdvertiseError", "Bluetooth not enabled")
            return
        }
        callback = @RequiresApi(Build.VERSION_CODES.O)
        object : AdvertisingSetCallback() {
            override fun onAdvertisingSetStarted(
                advertisingSet: AdvertisingSet,
                txPower: Int,
                status: Int
            ) {
                currentAdvertisingSet = advertisingSet
            }

            override fun onAdvertisingDataSet(advertisingSet: AdvertisingSet, status: Int) {
            }

            override fun onScanResponseDataSet(advertisingSet: AdvertisingSet, status: Int) {
            }

            override fun onAdvertisingSetStopped(advertisingSet: AdvertisingSet) {
                currentAdvertisingSet = null
            }
        }

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(false)
            .build()


        val parametrs = AdvertisingSetParameters.Builder()
            .setLegacyMode(true)
            .setInterval(AdvertisingSetParameters.INTERVAL_MEDIUM)
            .setTxPowerLevel(AdvertisingSetParameters.TX_POWER_MEDIUM)
            .setConnectable(false)
            .build()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(true)
            .build()

        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.BLUETOOTH_ADVERTISE
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        Log.e(TAG,"Bluetooth started")

        bluetoothAdapter.name = bluetoothName
        bluetoothAdapter.bluetoothLeAdvertiser.startAdvertisingSet(parametrs, data, null, null, null, callback)
        bluetoothAdapter.bluetoothLeAdvertiser.startAdvertising(settings, data, advertiseCallback)
        return
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @ReactMethod
    fun stopAdvertising() {
        Log.e(TAG, "Bluetooth is not enabled")
        val context = reactApplicationContext
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            Log.e(TAG, "Bluetooth is not enabled")
            return
        }
        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.BLUETOOTH_ADVERTISE
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        if(callback == null) {
            return
        }
        currentAdvertisingSet?.let {
            bluetoothAdapter.bluetoothLeAdvertiser?.stopAdvertisingSet(callback)
            currentAdvertisingSet = null
        }
        callback = null;
        bluetoothAdapter.bluetoothLeAdvertiser.stopAdvertising(advertiseCallback)
    }

    private val advertiseCallback = object : AdvertiseCallback() {

        override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
            sendEvent("onAdvertiseError", "Bluetooth advertise successful")
            Log.i(TAG, "Advertising started successfully")
        }

        override fun onStartFailure(errorCode: Int) {
            sendEvent("onAdvertiseError", "Advertising failed to start: $errorCode")
            Log.e(TAG, "Advertising failed to start: $errorCode")
        }
    }

    private fun sendEvent(eventName: String, message: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, message)
    }
}
