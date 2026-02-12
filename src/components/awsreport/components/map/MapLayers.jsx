import { GeoJSON, CircleMarker, Popup } from "react-leaflet";
import { useFitBounds } from "../../hooks/useFitBounds";
import { useRef, useEffect } from "react";

export default function MapLayers({
    data,
    areaGeo,
    region,
    province,
    metric,
    tabIndex,
    selectedStation,
    onPopupOpened
}) {
    useFitBounds(areaGeo, region, province);
    const markerRefs = useRef({});

    useEffect(() => {
        if (!selectedStation) return;

        const marker = markerRefs.current[selectedStation];
        if (marker) marker.openPopup();
    }, [selectedStation]);


    return (
        <>
            <GeoJSON
                key={`${region}-${province}`}
                data={areaGeo}
                style={{
                    color: "#333",
                    weight: 2,
                    fill: false,
                }}
            />

            {data.map((s) => {
                const meta =
                    metric === "temp"
                        ? s.tempMeta
                        : ({
                            1: s.rainlastMeta,
                            2: s.rain3dMeta,
                            3: s.rain7dMeta,
                        }[tabIndex] || s.rainMeta);

                if (!meta) return null;

                const { color, label } = meta;

                return (
                    <CircleMarker
                        ref={(ref) => {
                            if (ref) markerRefs.current[s.station_id] = ref;
                        }}
                        key={s.station_id}
                        center={[s.station_lat, s.station_lon]}
                        eventHandlers={{
                            popupopen: () => {
                                onPopupOpened?.(); // ⭐ reset ตอน popup เปิดจริง
                            }
                        }}
                        radius={7}
                        pathOptions={{
                            fillColor: color,
                            fillOpacity: 0.85,
                            stroke: true,
                            color: "#5b5a5a",
                            weight: 1,
                        }}
                    >
                        <Popup>
                            <strong>{s.station_name_th}</strong>
                            <br />
                            จังหวัด: {s.province_name_th}

                            {metric === "rain" && tabIndex === 1 && (
                                <>
                                    <br />
                                    ฝนสะสมวานนี้: {s.precip_yesterday ?? "-"} มม.
                                </>
                            )}

                            {metric === "rain" &&tabIndex === 2 && (
                                <>
                                    <br />
                                    ฝนสะสม 3 วัน: {s.precip_3days ?? "-"} มม.
                                </>
                            )}

                            {metric === "rain" &&tabIndex === 3 && (
                                <>
                                    <br />
                                    ฝนสะสม 7 วัน: {s.precip_7days ?? "-"} มม.
                                </>
                            )}

                            {metric === "rain" && tabIndex === 0 && (
                                <>
                                    <br />
                                    ฝนสะสมวันนี้: {s.precip_today ?? "-"} มม.
                                </>
                            )}

                            {metric === "temp" && tabIndex === 0 && (
                                <>
                                    <br />
                                    อุณหภูมิปัจจุบัน: {s.temperature ?? "-"} °C
                                </>
                            )}

                            {metric === "temp" && tabIndex === 1 && (
                                <>
                                    <br />
                                    อุณหภูมิสูงสุด: {s.temperature_max_today ?? "-"} °C
                                    <br />
                                    อุณหภูมิต่ำสุด: {s.temperature_min_today ?? "-"} °C
                                </>
                            )}

                            <br />
                            สถานะ: {label}
                        </Popup>
                    </CircleMarker>
                );
            })}
        </>
    );
}
