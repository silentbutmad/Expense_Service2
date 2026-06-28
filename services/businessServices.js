import {prisma} from "../models/db.js"

export const createBusinessService = async (user_id, data) => {
  const { business_name, gst_number, address } = data

  const business = await prisma.business.create({
    data: {
      user_id,
      business_name: business_name.trim(),
      gst_number: gst_number?.trim() || null,
      address: address?.trim() || null,
    },
  })

  return business
}

export const getAllBusinessesService = async (user_id) => {
  if (!user_id) {
    throw new Error("user_id is required")
  }

  const businesses = await prisma.business.findMany({
    where: {
      user_id,
    },
    select: {
      business_id: true,
      business_name: true,
      gst_number: true,
      address: true,
      created_at: true,
      parties: {
        select: {
          party_id: true,
          name: true,
          phone: true,
          party_type: true,
        },
      },
      items: {
        select: {
          item_id: true,
          name: true,
          price: true,
          unit: true,
          gst_rate: true,
          hsn_code: true,
        },
      },
    },
  })

  return businesses
}

export const createItemService = async (user_id, data) => {
  const { business_id, category_id, name, price, unit, gst_rate, hsn_code, } = data

  const business = await prisma.business.findFirst({
    where: {
      business_id,
      user_id,
    },
  })

  if (!business) {
    throw new Error("Business not found or not authorized")
  }

  if (category_id) {
    const category = await prisma.expenseCategory.findFirst({
      where: {
        category_id,
        business_id,
      },
    })

    if (!category) {
      throw new Error("Category not found or not authorized")
    }
  }

  const item = await prisma.item.create({
    data: {
      business_id,
      category_id,
      name: name.trim(),
      price: parseFloat(price),
      unit: unit?.trim() || null,
      gst_rate: gst_rate ? parseFloat(gst_rate) : null,
      hsn_code: hsn_code?.trim() || null,
    },
  })

  return item
}

export const getAllItemsService = async (user_id, business_id) => {
  if (!user_id) {
    throw new Error("user_id is required")
  }

  const business = await prisma.business.findFirst({
    where: {
      business_id,
      user_id,
    },
  })

  if (!business) {
    throw new Error("Business not found or not authorized")
  }

  const items = await prisma.item.findMany({
    where: {
      business_id,
    },
    select: {
      item_id: true,
      name: true,
      price: true,
      unit: true,
      gst_rate: true,
      hsn_code: true,
      category: {
        select: {
          category_id: true,
          category_name: true,
        },
      },
    },
  })

  return items
}

export const createPartyService = async (user_id, data) => {
  const { business_id, name, phone, party_type } = data
  console.log(data);
  const business = await prisma.business.findFirst({
    where: {
      business_id,
      user_id,
    },
  })

  if (!business) {
    throw new Error("Business not found or not authorized")
  }

  const party = await prisma.party.create({
    data: {
      business_id,
      name: name.trim(),
      phone: phone?.trim() || null,
      party_type,
    },
  })

  return party
}

export const getAllPartiesService = async (user_id, business_id) => {
  if (!user_id) {
    throw new Error("user_id is required")
  }

  const business = await prisma.business.findFirst({
    where: {
      business_id,
      user_id,
    },
  })

  if (!business) {
    throw new Error("Business not found or not authorized")
  }

  const parties = await prisma.party.findMany({
    where: {
      business_id,
    },
    select: {
      party_id: true,
      name: true,
      phone: true,
      party_type: true,
      created_at: true,
      updated_at: true,
    },
  })

  return parties
}
