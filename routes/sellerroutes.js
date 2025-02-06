
const express = require('express');
const Seller = require('../models/seller');
const router = express.Router();

router.post('/seller', async (req, res) => {
    try {
        const { name, email, password, storename, address,contact } = req.body;
        const existingSeller = await Seller.findOne({ email });
        if (existingSeller) {
            return res.status(400).json({ message: "Seller already exists" });
        }
        const newSeller = new Seller({ name, email, password, storename, address,contact });
        await newSeller.save();
        res.status(200).json({ message: "Seller created successfully", seller: newSeller });
    } catch (error) {
        res.status(500).json({ message: "Error creating Seller", error });
    }
    });
      

    router.post("/seller/bulk", async (req, res) => {
        try{
            const sellers =req.body;
            if(!Array.isArray(sellers) || sellers.length === 0){
                return res.status(400).json({message:"Please provide an array of sellers"});
            }
            const emails=sellers.map(sellerdata=>sellerdata.email);
            const existingSellers = await Seller.find({email:{$in:emails}});
            if(existingSellers.length>0){
                return res.status(400).json({message:"Some sellers already exists",existingSellers});
            }

            await Seller.insertMany(sellers);

            res.status(200).json({ message: "Sellers created successfully", sellers });
        }catch(error){
            res.status(500).json({ message: "Error creating Sellers", error });
    }
})


router.get('/seller', async (req, res) => {
    try {
        const sellers = await Seller.find();
        res.status(200).json({ sellers });
    } catch (error) {
        res.status(500).json({ message: "Error fetching Sellers", error });
    }
});
router.get("/seller/:id",async(req,res)=>{
    try{
        const user=await User.findById(req.params.id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json( user);
    }catch(error){
        res.status(500).json({message:"Error fetching User",error});
    }
})
// //create a router for put
 router.put("/seller/:id",async(req,res)=>{
    try{
        const updatedSeller=await Seller.findByIdAndUpdate(req.params.id,req.body,{new:true});
        if(!updatedSeller){
            return res.status(404).json({message:"Seller not found"});
        }
        res.status(200).json({message:"Seller updated successfully",updatedSeller});
        await seller.save();
        res.status(200).json({message:"Seller updated successfully",updatedSeller});
    }catch(error){
       return res.status(500).json({message:"Error updating Seller",updatedSeller});
    }
})
//create a router for patch
router.patch("/seller/:id",async(req,res)=>{
    try{
        const updatedSeller=await Seller.findByIdAndUpdate(req.params.id,req.body,{new:true});
        if(!updatedSeller){
            return res.status(404).json({message:"Seller not found"});
            }
            res.status(200).json({message:"Seller updated successfully",updatedSeller});
            await seller.save();
            res.status(200).json({message:"Seller updated successfully",updatedSeller});
            }catch(error){  
                return res.status(500).json({message:"Error updating Seller",updatedSeller});
            }
        })
        //create a router for delete
        router.delete("/seller/:id",async(req,res)=>{
            try{
                const deletedSeller=await Seller.findByIdAndDelete(req.params.id);
                if(!deletedSeller){
                    return res.status(404).json({message:"Seller not found"});
                }
                res.status(200).json({message:"Seller deleted successfully",deletedSeller});
                }catch(error){
                    return res.status(500).json({message:"Error deleting Seller",deletedSeller});
        }
    })


module.exports = router;