"use client";

import {useEffect, useState} from "react";

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_EXPIRY_DAYS = 20;

const getStoredLocation = ()=>{
    const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);

    if(!storedData) return null;

    const parsedData = JSON.parse(storedData);
    const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000 ; // 20 youm
    const isExpired = Date.now() - parsedData.timestamp > expiryTime;
    return isExpired ? null : parsedData;
}

const useLocationTracking = ()=> {
    const [location , setLocation] = useState<{country:string; city : string} | null>(null);

    useEffect(()=>{
        const stored = getStoredLocation();
        if(stored) {
            setLocation(stored);
            return;
        }

        fetch("http://ip-api.com/json/").then((res)=> res.json()).then((data)=>{
            if (data?.status === 'success' && data?.country && data?.city) {
                const newLocation = {
                    country : data.country,
                    city: data.city,
                    timestamp : Date.now(),
                }
                localStorage.setItem(LOCATION_STORAGE_KEY,JSON.stringify(newLocation));
                setLocation(newLocation);
            } else {
                // Set a default location when API fails or returns invalid data
                const fallbackLocation = {
                    country: "Unknown",
                    city: "Location Not Available",
                    timestamp: Date.now(),
                }
                setLocation(fallbackLocation);
            }
        }).catch((error)=> {
            // Set a default location when network request fails
            const fallbackLocation = {
                country: "Unknown",
                city: "Location Not Available",
                timestamp: Date.now(),
            }
            setLocation(fallbackLocation);
        });
    },[]);

    return location;
};
export default useLocationTracking;