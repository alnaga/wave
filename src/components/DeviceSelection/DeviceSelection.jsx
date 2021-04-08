import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppState } from '../../context/context';
import { getUserDevices, selectUserDevice } from '../../actions/spotify/spotifyActions';

const DeviceSelection = () => {
  const dispatch = useAppDispatch();
  const { accessToken, devices } = useAppState();

  const handleGetDevices = async () => {
    await getUserDevices(dispatch, accessToken);
  };

  const handleSelectDevice = (device) => async () => {
    await selectUserDevice(dispatch, accessToken, device);
    await getUserDevices(dispatch, accessToken);
  };

  return (
    <div>
      <button onClick={handleGetDevices}> Get Devices </button>
      {
        devices.length > 0
          && (
            <div className="flex-column">
              {
                devices.map((device) => {
                  return (
                    <div className="flex" onClick={handleSelectDevice(device)}>
                      { device.name }
                      {
                        device.is_active
                          && (
                            <span> - Active </span>
                          )
                      }
                    </div>
                  );
                })
              }
            </div>
          )
      }
    </div>
  );
};

export default DeviceSelection;
