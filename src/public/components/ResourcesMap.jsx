import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { MapPin, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { toMapPoint } from '../../shared/data/kenyaGeo';

const PALETTE = [
    '#1e293b',
    '#c41e3a',
    '#00a84f',
    '#0891b2',
    '#7c3aed',
    '#ea580c',
    '#0ea5e9',
    '#db2777',
    '#65a30d',
    '#b45309',
    '#4f46e5',
    '#059669'
];

const KENYA_CENTRE = [-0.5, 37.5];
const DEFAULT_ZOOM = 6;

const useStableColour = (values) => {
    const sorted = useMemo(
        () => Array.from(new Set(values.filter(Boolean))).sort(),
        [values]
    );
    return (value) => {
        const index = sorted.indexOf(value);
        return PALETTE[(index === -1 ? 0 : index) % PALETTE.length];
    };
};

/**
 * Fits the viewport to the markers once they are known. Kept in a child
 * component because react-leaflet hooks are only valid inside MapContainer.
 */
const FitToMarkers = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (points.length === 0) {
            map.setView(KENYA_CENTRE, DEFAULT_ZOOM);
            return;
        }
        if (points.length === 1) {
            map.setView([points[0].lat, points[0].lng], 9);
            return;
        }
        map.fitBounds(
            points.map((p) => [p.lat, p.lng]),
            { padding: [40, 40], maxZoom: 10 }
        );
    }, [map, points]);

    return null;
};

const ResourcesMap = ({ resources = [] }) => {
    const colourFor = useStableColour(resources.map((r) => r.category));

    const { groups, unresolved } = useMemo(() => {
        const buckets = new Map();
        const missing = new Map();

        resources.forEach((resource) => {
            const point = toMapPoint(resource);
            if (!point.matched) {
                const label = resource?.region || '(no region)';
                missing.set(label, (missing.get(label) || 0) + 1);
                return;
            }

            // Several resources usually share one county centroid, so markers are
            // grouped per location and drawn as a single bubble sized by count.
            const key = `${point.lat.toFixed(3)},${point.lng.toFixed(3)}`;
            const bucket = buckets.get(key) || {
                lat: point.lat,
                lng: point.lng,
                kind: point.kind,
                label: point.label,
                items: []
            };
            bucket.items.push(resource);
            buckets.set(key, bucket);
        });

        return {
            groups: Array.from(buckets.values()).sort((a, b) => b.items.length - a.items.length),
            unresolved: Array.from(missing.entries()).map(([label, count]) => ({ label, count }))
        };
    }, [resources]);

    const points = useMemo(() => groups.map((g) => ({ lat: g.lat, lng: g.lng })), [groups]);

    if (groups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
                <MapPin size={30} className="mb-3 text-gray-400" />
                <p className="text-sm font-semibold text-[#1e293b]">Nothing to plot yet</p>
                <p className="mt-1 max-w-sm text-xs text-gray-500">
                    {resources.length === 0
                        ? 'No resources match the current filters.'
                        : `None of these ${resources.length} resources has a region we can place on the map.`}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-gray-200">
                <MapContainer
                    center={KENYA_CENTRE}
                    zoom={DEFAULT_ZOOM}
                    scrollWheelZoom={false}
                    style={{ height: '460px', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={18}
                    />
                    <FitToMarkers points={points} />

                    {groups.map((group) => {
                        const count = group.items.length;
                        const radius = Math.min(10 + Math.sqrt(count) * 5, 26);
                        return (
                            <CircleMarker
                                key={`${group.lat}-${group.lng}`}
                                center={[group.lat, group.lng]}
                                radius={radius}
                                pathOptions={{
                                    color: '#ffffff',
                                    weight: 2,
                                    fillColor: colourFor(group.items[0].category),
                                    fillOpacity: 0.85
                                }}
                            >
                                <Popup minWidth={220} maxWidth={300}>
                                    <div className="text-xs">
                                        <p className="font-bold text-[#1e293b]">
                                            {group.label}
                                            {count > 1 && (
                                                <span className="ml-1 font-normal text-gray-500">
                                                    ({count} resources)
                                                </span>
                                            )}
                                        </p>
                                        <p className="mb-2 mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                                            {group.kind === 'exact'
                                                ? 'Recorded coordinates'
                                                : group.kind === 'county'
                                                    ? 'County centroid'
                                                    : 'Landmark centroid'}
                                        </p>
                                        <ul className="max-h-56 space-y-2 overflow-y-auto">
                                            {group.items.map((item) => (
                                                <li key={item.id ?? item.name} className="border-t border-gray-100 pt-2 first:border-0 first:pt-0">
                                                    <div className="flex items-start gap-1.5">
                                                        <span
                                                            className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                                                            style={{ backgroundColor: colourFor(item.category) }}
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-[#1e293b]">{item.name}</p>
                                                            <p className="text-[11px] text-gray-500">
                                                                {item.category}
                                                                {item.conservationStatus
                                                                    ? ` \u00b7 ${item.conservationStatus}`
                                                                    : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-gray-600">
                {Array.from(new Set(groups.map((g) => g.items[0].category).filter(Boolean))).sort().map((category) => (
                    <span key={category} className="inline-flex items-center gap-1.5">
                        <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: colourFor(category) }}
                        />
                        {category}
                    </span>
                ))}
                <span className="ml-auto text-gray-400">
                    {groups.length} location{groups.length === 1 ? '' : 's'} · bubble size shows how many resources share it
                </span>
            </div>

            {unresolved.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <p>
                        <span className="font-semibold">
                            {unresolved.reduce((sum, u) => sum + u.count, 0)} resource(s) not plotted.
                        </span>{' '}
                        Their region does not match a known county or landmark:{' '}
                        {unresolved.map((u) => `"${u.label}" (${u.count})`).join(', ')}. Add the region to
                        <span className="font-mono"> src/shared/data/kenyaGeo.js</span>, or record coordinates on the
                        resource.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ResourcesMap;