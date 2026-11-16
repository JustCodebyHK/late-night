package com.example.sensordashboard.data

import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.DatabaseReference
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class FirebaseRepository(private val database: FirebaseDatabase = FirebaseDatabase.getInstance()) {

    private val _dashboardData = MutableStateFlow(DashboardData())
    val dashboardData = _dashboardData.asStateFlow()

    private val scope = CoroutineScope(Dispatchers.IO)
    private var listenersRegistered = false
    private var temperatureListener: ValueEventListener? = null
    private var humidityListener: ValueEventListener? = null
    private var gasRawListener: ValueEventListener? = null
    private var gasPercentListener: ValueEventListener? = null
    private var minMaxListener: ValueEventListener? = null
    private var onlineListener: ValueEventListener? = null

    fun startListening() {
        if (listenersRegistered) return
        listenersRegistered = true

        val sensorRef = database.getReference("sensor")

        // Temperature listener
        temperatureListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val value = snapshot.getValue(Double::class.java)
                updateCurrent { current -> current.copy(temperature = value) }
            }
            override fun onCancelled(error: DatabaseError) {}
        }
        sensorRef.child("temperature").addValueEventListener(temperatureListener!!)

        // Humidity listener
        humidityListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val value = snapshot.getValue(Double::class.java)
                updateCurrent { current -> current.copy(humidity = value) }
            }
            override fun onCancelled(error: DatabaseError) {}
        }
        sensorRef.child("humidity").addValueEventListener(humidityListener!!)

        // Gas Raw listener
        gasRawListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val value = snapshot.getValue(Int::class.java)
                updateCurrent { current -> current.copy(gasRaw = value) }
            }
            override fun onCancelled(error: DatabaseError) {}
        }
        sensorRef.child("gasRaw").addValueEventListener(gasRawListener!!)

        // Gas Percent listener
        gasPercentListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val value = snapshot.getValue(Int::class.java)
                updateCurrent { current -> current.copy(gasPercent = value) }
            }
            override fun onCancelled(error: DatabaseError) {}
        }
        sensorRef.child("gasPercent").addValueEventListener(gasPercentListener!!)

        // Min/Max listener
        minMaxListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val minTemp = snapshot.child("min").getValue(Double::class.java)
                val maxTemp = snapshot.child("max").getValue(Double::class.java)
                val minTempTime = snapshot.child("minTime").getValue(Long::class.java)
                val maxTempTime = snapshot.child("maxTime").getValue(Long::class.java)
                val minGas = snapshot.child("minGas").getValue(Int::class.java)
                val maxGas = snapshot.child("maxGas").getValue(Int::class.java)
                val minGasTime = snapshot.child("minGasTime").getValue(Long::class.java)
                val maxGasTime = snapshot.child("maxGasTime").getValue(Long::class.java)

                _dashboardData.value = _dashboardData.value.copy(
                    minMax = MinMaxData(
                        minTemp = minTemp,
                        maxTemp = maxTemp,
                        minTempTime = minTempTime,
                        maxTempTime = maxTempTime,
                        minGas = minGas,
                        maxGas = maxGas,
                        minGasTime = minGasTime,
                        maxGasTime = maxGasTime
                    )
                )
            }
            override fun onCancelled(error: DatabaseError) {}
        }
        sensorRef.child("minmax").addValueEventListener(minMaxListener!!)

        // Online status
        onlineListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val isOnline = snapshot.exists() && snapshot.getValue() != null
                _dashboardData.value = _dashboardData.value.copy(
                    isOnline = isOnline,
                    lastUpdate = if (isOnline) System.currentTimeMillis() else _dashboardData.value.lastUpdate
                )
            }
            override fun onCancelled(error: DatabaseError) {}
        }
        sensorRef.child("temperature").addValueEventListener(onlineListener!!)
    }

    fun stopListening() {
        if (!listenersRegistered) return
        listenersRegistered = false
        val sensorRef = database.getReference("sensor")
        temperatureListener?.let { sensorRef.child("temperature").removeEventListener(it) }
        humidityListener?.let { sensorRef.child("humidity").removeEventListener(it) }
        gasRawListener?.let { sensorRef.child("gasRaw").removeEventListener(it) }
        gasPercentListener?.let { sensorRef.child("gasPercent").removeEventListener(it) }
        minMaxListener?.let { sensorRef.child("minmax").removeEventListener(it) }
        onlineListener?.let { sensorRef.child("temperature").removeEventListener(it) }
    }

    private fun updateCurrent(block: (SensorReading) -> SensorReading) {
        _dashboardData.value = _dashboardData.value.copy(
            current = block(_dashboardData.value.current),
            lastUpdate = System.currentTimeMillis(),
            isOnline = true
        )
    }

    fun resetMinMax() {
        val minMaxRef = database.getReference("sensor/minmax")
        minMaxRef.setValue(mapOf(
            "min" to null,
            "max" to null,
            "minTime" to null,
            "maxTime" to null,
            "minGas" to null,
            "maxGas" to null,
            "minGasTime" to null,
            "maxGasTime" to null
        ))
    }
}