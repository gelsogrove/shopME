import { Request, Response } from "express";
import { eventsService } from "../../../services/events.service";
import { AppError } from "../middlewares/error.middleware";

export class EventsController {
  async getEventsForWorkspace(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params
      console.log("Getting events for workspace:", workspaceId);

      const events = await eventsService.getAllForWorkspace(workspaceId)
      console.log("Events found:", events);

      return res.status(200).json(events)
    } catch (error) {
      console.error("Error getting events:", error)
      throw new AppError(500, "Failed to get events")
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const { id, workspaceId } = req.params

      const event = await eventsService.getById(id, workspaceId)

      if (!event) {
        return res.status(404).json({ message: "Event not found" })
      }

      return res.status(200).json(event)
    } catch (error) {
      console.error("Error getting event:", error)
      throw new AppError(500, "Failed to get event")
    }
  }

  async createEvent(req: Request, res: Response) {
    try {
      console.log("Creating event - Request params:", req.params);
      console.log("Creating event - Request URL:", req.originalUrl);
      
      // Estrai il workspaceId dall'URL se non è presente nei parametri
      let workspaceId = req.params.workspaceId;
      
      if (!workspaceId) {
        // Prova a estrarre l'ID dal percorso URL
        const urlParts = req.originalUrl.split('/');
        const workspaceIndex = urlParts.findIndex(part => part === 'workspaces');
        if (workspaceIndex !== -1 && workspaceIndex + 1 < urlParts.length) {
          workspaceId = urlParts[workspaceIndex + 1];
          console.log("Extracted workspaceId from URL:", workspaceId);
        }
      }
      
      if (!workspaceId) {
        console.error("Workspace ID is missing");
        return res.status(400).json({ message: "Workspace ID is required" });
      }
      
      const { 
        name, 
        description, 
        startDate, 
        endDate, 
        location, 
        price, 
        currency, 
        isActive,
        maxAttendees 
      } = req.body
      
      console.log("Request body:", req.body);
      
      // Validazione dei campi obbligatori
      if (!name || !description || !startDate || !endDate || !location || price === undefined) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          required: ["name", "description", "startDate", "endDate", "location", "price"] 
        });
      }

      console.log("Creating event with dates:", { startDate, endDate });
      console.log("Creating event for workspace:", workspaceId);

      // Ensure we're handling the date correctly whether it's a string or ISO format
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        console.error("Invalid date format:", { startDate, endDate });
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      // Verifica che la data di inizio sia precedente alla data di fine
      if (parsedStartDate >= parsedEndDate) {
        return res.status(400).json({ message: "Start date must be before end date" });
      }

      const result = await eventsService.create({
        name,
        description,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        location,
        price: parseFloat(price),
        workspaceId,
        currency: currency || "EUR",
        isActive: isActive !== undefined ? isActive : true,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined
      })

      return res.status(201).json(result)
    } catch (error) {
      console.error("Error creating event:", error)
      if (error.message === "workspaceId is required") {
        return res.status(400).json({ message: "Workspace ID is required" });
      }
      throw new AppError(500, "Failed to create event")
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const { id, workspaceId } = req.params
      const { 
        name, 
        description, 
        startDate, 
        endDate, 
        location, 
        price, 
        currency, 
        isActive,
        maxAttendees,
        currentAttendees
      } = req.body

      console.log("Updating event with dates:", { startDate, endDate });

      // Parse dates if they exist
      let parsedStartDate, parsedEndDate;
      
      if (startDate) {
        parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) {
          console.error("Invalid start date format:", startDate);
          return res.status(400).json({ message: "Invalid start date format" });
        }
      }
      
      if (endDate) {
        parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          console.error("Invalid end date format:", endDate);
          return res.status(400).json({ message: "Invalid end date format" });
        }
      }
      
      // Verifica che la data di inizio sia precedente alla data di fine se entrambe sono presenti
      if (parsedStartDate && parsedEndDate && parsedStartDate >= parsedEndDate) {
        return res.status(400).json({ message: "Start date must be before end date" });
      }

      const priceValue = price !== undefined ? parseFloat(price) : undefined
      
      const result = await eventsService.update(id, workspaceId, {
        name,
        description,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        location,
        price: priceValue,
        currency,
        isActive,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
        currentAttendees: currentAttendees ? parseInt(currentAttendees) : undefined
      })

      if (!result) {
        return res.status(404).json({ message: "Event not found" })
      }

      return res.status(200).json(result)
    } catch (error) {
      console.error("Error updating event:", error)
      if (error.message === "Event not found") {
        return res.status(404).json({ message: "Event not found" })
      }
      throw new AppError(500, "Failed to update event")
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const { id, workspaceId } = req.params

      const event = await eventsService.getById(id, workspaceId)

      if (!event) {
        return res.status(404).json({ message: "Event not found" })
      }

      await eventsService.delete(id, workspaceId)

      return res.status(204).send()
    } catch (error) {
      console.error("Error deleting event:", error)
      throw new AppError(500, "Failed to delete event")
    }
  }
} 