import { Router } from "express";
import { MoneyTreeIntegrationService } from "../services/moneytree-integration.js";

const router = Router();

// Endpoint to fetch and sync MoneyTree properties
router.get("/sync", async (req, res) => {
  try {
    const properties = await MoneyTreeIntegrationService.fetchProperties();
    
    const convertedProperties = properties.map(prop => 
      MoneyTreeIntegrationService.convertToProject(prop)
    );
    
    res.json({
      success: true,
      count: convertedProperties.length,
      properties: convertedProperties.slice(0, 10), // Return first 10 for preview
      message: `Successfully synced ${convertedProperties.length} properties from MoneyTree Realty`
    });
  } catch (error) {
    console.error('MoneyTree sync error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to sync MoneyTree properties",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint to get raw MoneyTree data
router.get("/raw", async (req, res) => {
  try {
    const properties = await MoneyTreeIntegrationService.fetchProperties();
    res.json({
      success: true,
      count: properties.length,
      properties: properties.slice(0, 5), // Return first 5 for inspection
    });
  } catch (error) {
    console.error('MoneyTree raw data error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch MoneyTree raw data"
    });
  }
});

export default router;