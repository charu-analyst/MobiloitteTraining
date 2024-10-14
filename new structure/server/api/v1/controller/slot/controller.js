import apiError from "../../../../helper/apiError";
import responseMessages from "../../../../../assets/responseMessages";
import successResponse from "../../../../../assets/response";
import Joi from "joi";
import commonFunction from "../../../../helper/utils";
import mongoose from "mongoose";
import services from "../../services/doctor";
const { checkAdmin, checkDoctor, createSlot } = services;

class slotController {
    async slotCreation(req, res, next) {
        const fields = Joi.object({
            doctorId: Joi.string()
                .custom((value, helpers) => {
                    //custom validation
                    if (!mongoose.Types.ObjectId.isValid(value)) {
                        return helpers.error("any.invalid");
                    }
                    return value;
                })
                .required(),
            startDate: Joi.number().required(),
            endDate: Joi.number().required(),
            startTime: Joi.number().required(),
            endTime: Joi.number().required(),
            slotDuration: Joi.number().required(),
            weekOfDay: Joi.string().required(),
            breakHour: Joi.number().required(),
        });
        try {
            const validated = await fields.validateAsync(req.body);
            const {
                doctorId,
                startDate,
                endDate,
                startTime,
                endTime,
                slotDuration,
                breakHour,
                weekOfDay,
            } = validated;
            const adminDtails = await checkAdmin(req.userId);
            if (!adminDtails) {
                throw apiError.notFound(responseMessages.ADMIN_NOT_FOUND);
            }
            const doctorDetails = await checkDoctor(doctorId);
            if (!doctorDetails) {
                throw apiError.notFound(responseMessages.DOCTOR_NOT_FOUND);
            }
            const day = [
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
            ];
            const startingDate = new Date();
            startingDate.setDate(startDate);
            //   const day = startingDate.getDay();
            const endingDate = new Date();
            endingDate.setDate(endDate);
            let startingHour = startingDate.setHours(startTime, 0);
            const endingHour = startingDate.setHours(endTime, 0);
            const breakes = startingDate.setHours(breakHour, 0);
            while (startingDate < endingDate) {
                const date = new Date();
                const days = weekOfDay.toLowerCase();
                const weekends = startingDate.getDay();
                const isInclude = day.indexOf(weekOfDay);
                if (weekends !== isInclude) {
                    const availableSlots = [];
                    while (startingHour < endingHour) {
                        let currentTime = startingDate.getHours();
                        if (currentTime.getHours() !== breakes) {
                            availableSlots.push(currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
                        }
                        currentTime.setMinutes(currentTime.getMinutes() + 15);
                        
                    }
                    startingDate.setDate(startingDate.getDate() + 1);
                    console.log(availableSlots);
                  
                }

            }







            // let slots = [];
            //             for (var i = startingDate; i <= endingDate; i++) {
            //                 while (startingHour < endingHour) {
            //                     const slot = {
            //                         start: startingHour,
            //                         end: new Date(startingHour.getTime() + slotDuration * 60000), // Convert slot duration to milliseconds
            //                       };
            //                       slots.push(slot);
            //                       // Increment current time by slot duration
            //                       startingHour = new Date(startingHour.getTime() + slotDuration * 60000); // Convert slot duration to milliseconds
            //                    console.log(slot);
            //                 }
            //             }
            //             console.log(slots);

            //             const obj = {
            //                 doctorId: doctorId,
            //                 startTime: startingHour,
            //                 endTime: endingHour,
            //                 slots: slots
            //             }
            //             console.log(obj);
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }
}

export default new slotController();

// // Generate slots for a given month
// function generateSlots(startDate, endDate) {
//   const slots = [];
//   let currentDate = new Date(startDate);

//   // Loop through each day
//   while (currentDate <= endDate) {
//     const dayOfWeek = currentDate.getDay();

//     // Exclude Sunday (dayOfWeek = 0) and Saturday (dayOfWeek = 6)
//     if (dayOfWeek !== 0 && dayOfWeek !== 6) {
//       const availableSlots = [];

//       // Generate slots at 15-minute intervals excluding the break
//       let currentTime = new Date(currentDate);
//       while (currentTime < endDate) {
//         // Exclude the 1-hour break (e.g., from 12:00 PM to 1:00 PM)
//         if (currentTime.getHours() !== 12) {
//           availableSlots.push(currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
//         }
//         currentTime.setMinutes(currentTime.getMinutes() + 15);
//       }
//     }

//     currentDate.setDate(currentDate.getDate() + 1);
//   }

//   return slots;
// }

// // API endpoint to retrieve slots for a given month
// app.get('/api/slots', (req, res) => {
//   const startDate = new Date(); // Use the current date as the start date
//   const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); // Set end date as the last day of the month

//   const slots = generateSlots(startDate, endDate);

//   res.json({
//     start_date: startDate.toISOString().slice(0, 10),
//     end_date: endDate.toISOString().slice(0, 10),
//     slots: slots
//   });
// });

// // Start the server
// app.listen(3000, () => {
//   console.log('API server running on port 3000');
// });
