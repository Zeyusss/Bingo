import { NextFunction, Request, Response } from "express";
import {
  fetchRevenueData,
  fetchDeviceUsage,
  fetchWorldActivity,
  fetchSystemStats,
  fetchResourceMonitor,
} from "../utils/dashboardData";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";

export async function getRevenue(req: Request, res: Response) {
  try {
    const data = await fetchRevenueData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
}

export async function getDeviceUsage(req: Request, res: Response) {
  try {
    const data = await fetchDeviceUsage();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch device usage data" });
  }
}

export async function getWorldActivity(req: Request, res: Response) {
  try {
    const data = await fetchWorldActivity();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch world activity data" });
  }
}

export async function getSystemStats(req: Request, res: Response) {
  try {
    const data = await fetchSystemStats();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch system stats" });
  }
}

export async function getResourceMonitor(req: Request, res: Response) {
  try {
    const data = await fetchResourceMonitor();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch resource monitor data" });
  }
}


// get all products
export const getAllProducts = async (req:Request,res:Response,next:NextFunction)=>{
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page -1) * limit;

    const [products,totalProducts] = await Promise.all([
      prisma.products.findMany({
        where:{
          starting_date:null,
        },
        skip,
        take:limit,
        orderBy : {createdAt:"desc"},
        select : {
          id: true,
          title:true,
          slug:true,
          sale_price:true,
          stock:true,
          createdAt:true,
          ratings:true,
          category:true,
          images:{
            select:{url:true},
            take:1,
          },
          Shop: {
            select : {name:true},
          },
        },
      }),
      prisma.products.count({
        where:{
          starting_date:null,
        }
      })
    ]);

    const totalPages = Math.ceil(totalProducts / limit);
    res.status(200).json({
      success:true,
      data:products,
      meta:{
        totalProducts,
        currentPage:page,
        totalPages,
      },
    });
  } catch (error) {
    return next(error)
  } 
}

//get all events 
export const getAllEvents = async(req:Request,res:Response,next:NextFunction)=>{
   try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page -1) * limit;

    const [events,totalEvents] = await Promise.all([
      prisma.products.findMany({
        where:{
          starting_date: {not:null},
        },
        skip,
        take:limit,
        orderBy : {createdAt:"desc"},
        select : {
          id: true,
          title:true,
          slug:true,
          sale_price:true,
          stock:true,
          createdAt:true,
          ratings:true,
          category:true,
          starting_date:true,
          ending_date:true,
          images:{
            select:{url:true},
            take:1,
          },
          Shop: {
            select : {name:true},
          },
        },
      }),
      prisma.products.count({
        where:{
          starting_date:{not : null},
        }
      })
    ]);

    const totalPages = Math.ceil(totalEvents / limit);
    res.status(200).json({
      success:true,
      data:events,
      meta:{
        totalEvents,
        currentPage:page,
        totalPages,
      },
    });
  } catch (error) {
    return next(error)
  } 
}

//get all admins
export const getAllAdmins = async(req:Request,res:Response,next:NextFunction)=>{
try {
  const admins = await prisma.users.findMany({
    where:{
      role:"admin",
    }
  })

  res.status(201).json({
    success:true,
    admins,
  })
} catch (error) {
  return next(error)
}
}

//add new admin
export const addNewAdmin = async(req:Request,res:Response,next:NextFunction)=>{
try {
  const {email,role} = req.body;

  const isUser = await prisma.users.findUnique({where:{email}});
  if(!isUser){
    return next(new ValidationError("Something went wrong!"))
  }

  const updateRole = await prisma.users.update({
    where:{email},
    data : {
      role,
    }
  })

  res.status(201).json({
    success:true,
    updateRole,
  })
} catch (error) {
  return next(error)
}
}

// fetch all customizations
export const getAllCustomizations = async(req:Request,res:Response,next:NextFunction)=>{
try {
  const config = await prisma.site_config.findFirst();

  return res.status(200).json({
    categories:config?.categories || [],
    subCategories : config?.subCategories || {},
    logo: config?.logo || null,
    banner : config?.banner || null,
  })
} catch (error) {
  return next(error)
}
}


// get all users
export const getAllUsers = async (req:Request,res:Response,next:NextFunction)=>{
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page -1) * limit;

    const [users,totalUsers] = await Promise.all([
      prisma.users.findMany({
        skip,
        take:limit,
        orderBy : {createdAt:"desc"},
        select : {
          id: true,
          name:true,
          email:true,
          role:true,
          createdAt:true,
        },
      }),
      prisma.users.count(),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);
    res.status(200).json({
      success:true,
      data:users,
      meta:{
        totalUsers,
        currentPage:page,
        totalPages,
      },
    });
  } catch (error) {
    return next(error)
  } 
}

// get all sellers
export const getAllSellers = async (req:Request,res:Response,next:NextFunction)=>{
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page -1) * limit;

    const [sellers,totalSellers] = await Promise.all([
      prisma.sellers.findMany({
        skip,
        take:limit,
        orderBy : {createdAt:"desc"},
        select : {
          id: true,
          name:true,
          email:true,
          createdAt:true,
          shop:{
            select:{
              name:true,
              avatar:true,
              address:true,
            }
          }
        },
      }),
      prisma.sellers.count(),
    ]);

    const totalPages = Math.ceil(totalSellers / limit);
    res.status(200).json({
      success:true,
      data:sellers,
      meta:{
        totalSellers,
        currentPage:page,
        totalPages,
      },
    });
  } catch (error) {
    return next(error)
  } 
}