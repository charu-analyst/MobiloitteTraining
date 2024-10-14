import user from "./api/v1/controller/user/routes";
import admin from "./api/v1/controller/admin/routes"
import hospital from "./api/v1/controller/hospital/routes"



export default function routes(app) {
    app.use('/api/v1/user', user)
    app.use('/api/v1/admin', admin)
    app.use('/api/v1/hospital', hospital)


}

