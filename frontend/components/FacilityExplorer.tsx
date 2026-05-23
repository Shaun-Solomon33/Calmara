
import React, { useState, useEffect } from 'react';
import type { MedicalFacility } from '../types';
import { facilitiesData } from '../data/facilities';

const FacilityExplorer: React.FC = () => {
    const [selectedFacilityId, setSelectedFacilityId] = useState<string>(() => {
        return localStorage.getItem('calmara-selectedFacility') || facilitiesData[0].id;
    });

    useEffect(() => {
        localStorage.setItem('calmara-selectedFacility', selectedFacilityId);
    }, [selectedFacilityId]);

    const selectedFacility = facilitiesData.find(f => f.id === selectedFacilityId);

    const getLevelColor = (level: 'Low' | 'Moderate' | 'High' | 'Variable') => {
        switch (level) {
            case 'Low': return 'bg-green-100 text-green-800';
            case 'Moderate': return 'bg-yellow-100 text-yellow-800';
            case 'High': return 'bg-red-100 text-red-800';
            case 'Variable': return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Facility Explorer</h3>
                <p className="text-slate-600 mb-6">Get sensory information about specific medical locations.</p>
                <div>
                    <label htmlFor="facility-select" className="block text-sm font-medium text-slate-600 mb-1">Select a Location</label>
                    <select
                        id="facility-select"
                        value={selectedFacilityId}
                        onChange={e => setSelectedFacilityId(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        {facilitiesData.map(facility => (
                            <option key={facility.id} value={facility.id}>
                                {facility.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedFacility && (
                <div className="animate-fade-in space-y-8">
                    {/* Sensory Info Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                        <h4 className="text-xl font-bold text-slate-800 mb-4">Sensory Environment at {selectedFacility.name}</h4>
                        <div className="space-y-4">
                            {selectedFacility.sensoryInfo.map(info => (
                                <div key={info.aspect}>
                                    <div className="flex items-center gap-3">
                                        <h5 className="font-semibold text-slate-700">{info.aspect}</h5>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getLevelColor(info.level)}`}>{info.level}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm">{info.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Quiet Spaces Card */}
                    {selectedFacility.quietSpaces.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                            <h4 className="text-xl font-bold text-slate-800 mb-4">Find a Quiet Space</h4>
                             <ul className="space-y-4">
                                {selectedFacility.quietSpaces.map(space => (
                                    <li key={space.name} className="p-4 bg-teal-50/50 rounded-lg border border-teal-100">
                                        <h5 className="font-semibold text-teal-800">{space.name}</h5>
                                        <p className="text-sm font-medium text-slate-600">{space.location}</p>
                                        <p className="text-sm text-slate-500 mt-1">{space.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                     {/* Pro Tips Card */}
                     {selectedFacility.tips.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                            <h4 className="text-xl font-bold text-slate-800 mb-4">Community Pro-Tips</h4>
                             <ul className="space-y-3 list-disc list-inside text-slate-600">
                                {selectedFacility.tips.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FacilityExplorer;