import loginRoute from './route/login_route';

import { join } from 'path';
import { config } from 'dotenv';
import { App, MLPortalServiceRoutes } from './helper';

config({ path: join(__dirname, '../.env') });

const domain: string = '/mlportal/api/v1/';

const routes: MLPortalServiceRoutes[] = [
    {
        path: `${domain}login`,
        router: loginRoute
    }
];

const app: App = new App(routes);
export {
    app
}