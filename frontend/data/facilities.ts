import type { MedicalFacility } from '../types';

export const facilitiesData: MedicalFacility[] = [
    {
        id: 'city-general',
        name: 'City General Hospital',
        address: '123 Health St, Metropolis, USA',
        sensoryInfo: [
            {
                aspect: 'Lighting',
                level: 'High',
                description: 'Main lobby and hallways use bright, fluorescent lighting. Some patient rooms have dimmable lights.',
            },
            {
                aspect: 'Noise Level',
                level: 'Variable',
                description: 'Lobby and emergency areas can be very loud. Pediatric wing is generally quieter but has occasional alarms.',
            },
            {
                aspect: 'Smells',
                level: 'High',
                description: 'Strong antiseptic and cleaning solution smells are common throughout the facility.',
            },
            {
                aspect: 'Crowds',
                level: 'High',
                description: 'The main lobby and cafeteria are often crowded, especially during visiting hours (11am-8pm).',
            }
        ],
        quietSpaces: [
            {
                name: 'Interfaith Chapel',
                location: '1st Floor, East Wing',
                description: 'A designated quiet space, open to all. Usually empty and has low, natural lighting.'
            },
            {
                name: 'Family Waiting Room 3B',
                location: '3rd Floor, near Pediatrics',
                description: 'A smaller, less-used waiting area. It has comfortable chairs and is away from main foot traffic.'
            }
        ],
        tips: [
            'Consider bringing sunglasses for the hallways.',
            'Noise-cancelling headphones are highly recommended.',
            'Enter through the East Wing entrance to bypass the main lobby crowd.',
            'Ask for a room away from the nursing station if possible.'
        ]
    },
    {
        id: 'downtown-dental',
        name: 'Downtown Dental Clinic',
        address: '456 Molar Ave, Metropolis, USA',
        sensoryInfo: [
            {
                aspect: 'Lighting',
                level: 'High',
                description: 'Very bright overhead lights are used in the examination rooms. Waiting room has softer lighting.',
            },
            {
                aspect: 'Noise Level',
                level: 'Moderate',
                description: 'The sounds of drills and suction tools are common. The waiting room has soft music playing.',
            },
            {
                aspect: 'Smells',
                level: 'Moderate',
                description: 'Distinctive smells of fluoride and dental materials are present.',
            }
        ],
        quietSpaces: [
            {
                name: 'Consultation Room',
                location: 'Ask at front desk',
                description: 'If not in use, this room is quiet and can be used for a short break. It has a door that closes.'
            }
        ],
        tips: [
            'Ask the hygienist to explain what each tool does before they use it.',
            'Bring your own headphones and music to listen to during the procedure.',
            'Request a weighted blanket for a calming effect in the chair.'
        ]
    },
    {
        id: 'creekside-pediatrics',
        name: 'Creekside Pediatrics',
        address: '789 Child Way, Suburbia, USA',
        sensoryInfo: [
            {
                aspect: 'Lighting',
                level: 'Moderate',
                description: 'Waiting room is brightly colored with standard office lighting. Exam rooms have adjustable lights.',
            },
            {
                aspect: 'Noise Level',
                level: 'Variable',
                description: 'Can be noisy with children playing or crying. They offer "quiet hours" for the first appointment of the day.',
            },
            {
                aspect: 'Visuals',
                level: 'High',
                description: 'The walls are covered in colorful murals and posters, which can be visually busy.',
            }
        ],
        quietSpaces: [
            {
                name: 'Nursing Room',
                location: 'End of the main hall',
                description: 'A private, single-family room with a comfortable chair and dim lighting. Available if not occupied.'
            }
        ],
        tips: [
            'Call ahead to ask about the quietest time of day to visit.',
            'Request the first appointment after lunch for a calmer waiting room.',
            'Ask to be put in an exam room immediately upon arrival to bypass the waiting room.'
        ]
    }
];
