'use client'
import { useEffect, useState } from 'react';
import mqtt, { IClientOptions } from 'mqtt';

const MqttDisplay = () => {
  const [mqttData, setMqttData] = useState<string>('');
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const MAX_PAPERS = 500;

  useEffect(() => {
    const brokerUrl = `wss://${process.env.NEXT_PUBLIC_MQTT_URL}:8884/mqtt`;
    const options: IClientOptions = {
      username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
      password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
      protocol: 'wss' as 'wss', // explicitly type as 'wss'
      port: parseInt(process.env.NEXT_PUBLIC_MQTT_PORT || '8883'),
    };

    const mqttClient = mqtt.connect(brokerUrl, options);

    mqttClient.on('connect', () => {
      console.log('Spojeno na MQTT broker');
      mqttClient.subscribe('denka_01/paper', (err) => {
        if (err) console.error('Greška pri pretplati:', err);
      });
    });

    mqttClient.on('message', (topic, message) => {
      if (topic === 'denka_01/paper') {
        setMqttData(message.toString());
      }
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Greška:', err);
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  const paperCount = parseInt(mqttData) || 0;
  const percentage = (paperCount / MAX_PAPERS) * 100;

  const getProgressBarColor = () => {
    if (paperCount <= 19) return '#ef4444';
    if (paperCount <= 49) return '#eab308';
    return '#22c55e';
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      maxWidth: '400px',
      margin: '20px 0'
    }}>
      <h2 style={{ marginBottom: '15px', fontSize: '1.2em', fontWeight: 'bold' }}>
        Status Papira u Printeru
      </h2>
      
      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontWeight: 'bold' }}>
          {paperCount} / {MAX_PAPERS} listova
        </span>
      </div>

      <div style={{
        width: '100%',
        height: '20px',
        backgroundColor: '#eee',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: getProgressBarColor(),
          transition: 'width 0.5s ease-in-out'
        }} />
      </div>

      {paperCount <= 49 && (
        <div style={{
          marginTop: '10px',
          color: paperCount <= 19 ? '#ef4444' : '#eab308',
          fontWeight: 'bold'
        }}>
          {paperCount <= 19 ? 'Kritično!' : 'Niska razina papira'}
        </div>
      )}
    </div>
  );
};

export default MqttDisplay;