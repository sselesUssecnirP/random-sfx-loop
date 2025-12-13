import fs from 'fs';
import path from 'path';
import { Event, ExtendedClient } from '../types/bot';

export default async (client: ExtendedClient) => {

    const eventsFolder = path.join(__dirname, '..', 'events');

        for (const entry of fs.readdirSync(eventsFolder).filter(f => f.endsWith('.js'))) {

            const exported = await import(path.join(eventsFolder, entry));
            const event = exported.default as Event;


            if (event.manual)
                client.events.set(event.name, event)
            else
                event.run(client)
        }
    }