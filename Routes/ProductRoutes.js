import express from "express";
import asyncHandler from "express-async-handler";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import Product from "./../Model/ProductModel.js";

const productRouter = express.Router()

// GET ALL PRODUCT
productRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        console.log(req.query.keyword)
        //console.groupCollapsed("ta");
        const pageSize = 6;
        const page = Number(req.query.pageNumber) || 1 ;
        const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },    
          }
        :{};
        
            const count = await Product.countDocuments({} );
            const products = await Product.find({})
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({_id: 1});
            res.json({products,page,pages:Math.ceil(count / pageSize)});
        
    })
    /*
   //Test
   asyncHandler(async (req, res) =>{
        const pageSize = 6;
        const page = Number(req.query.pageNumber) || 1 ;
        const keyword = req.query.keyword;
        const count = await Product.countDocuments({ ...keyword } );
        const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({_id: 1});
        res.json({products,page,pages:Math.ceil(count / pageSize)});
   })
   */
);
//Test
productRouter.get(
    "/search/",
    asyncHandler(async (req, res) => {
        console.log(req.query.keyword)
        console.log("keyword")
        const pageSize = 6;
        //const page = Number(req.params.pageNumber) || 1 ;
        const page = Number(req.query.pageNumber) || 1 ;
        const keyword = req.query.keyword
       ? {
            name: {
                $regex: req.query.keyword,
                $options:'i',
            },    
          }
        :{};
        
        const count = await Product.countDocuments({ ...keyword } );
        console.log(count)
        const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({_id: -1});
        res.json({products,page,pages:Math.ceil(count / pageSize)});  
    })
);

/*
// GET ALL PRODUCT
productRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const pageSize = 6;
        const page = Number(req.query.pageNumber) || 1 ;
        const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },    
          }
        :{};
      
       // const keyword = '';
        console.log('keyword')
        const count = await Product.countDocuments({ ...keyword } );
        console.log(count)
        const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({_id: 1});
        res.json({products,page,pages:Math.ceil(count / pageSize)});
    })
);
*/
/*
// GET BY SEARCH
productRouter.get(
    "/s",
    asyncHandler(async (req, res) => {
        const pageSize = 6;
        const page = Number(req.query.pageNumber) || 1 ;
        const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },    
          }
        :{};
        console.log('keyword')
        const count = await Product.countDocuments({ ...keyword } );
        console.log(count)
        const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({_id: 1});
        res.json({products,page,pages:Math.ceil(count / pageSize)});
    })
);

*/

// ADMIN GET ALL PRODUCT WITHOUT SAERCH
productRouter.get(
    "/all", 
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const products = await Product.find({}).sort({ _id:-1 });
        res.json(products);
    })
    );


// GET SINGLE PRODUCT
productRouter.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id);

        if(product){
            res.json(product);
        } else {
            res.status(404)
            throw new Error("Product not Found");
        }
    })
);

// PRODUCT REVIEW
productRouter.post(
    "/:id/review",
    protect,
    asyncHandler(async (req, res) => {
        const {rating, comment} = req.body;
        const product = await Product.findById(req.params.id);

        if(product){
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );
            if(alreadyReviewed){
                res.status(400);
                throw new Error("Prodcut already Reviewed");
            }
            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };
            product.reviews.push(review)
            product.numReviews = product.reviews.length
            product.rating =
            product.reviews.reduce((acc,item) => item.rating + acc, 0) /
            product.reviews.length;

            await product.save()
            res.status(201).json({message:"Reviewed Added"});
        } else {
            res.status(404)
            throw new Error("Product not Found");
        }
    })
);

// DELETE PRODUCT
productRouter.delete(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id);
        if(product){
            await product.remove();
            res.json({ message : "Product deleted"});
        } else {
            res.status(404);
            throw new Error("Product not Fount");    
        }
    })
);

// EDIT PRODUCT
productRouter.put(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { name, price, description, image, countInStock } = req.body;
        const product = await Product.findById(req.params.id);
        if (product) {
                product.name= name || product.name;
                product.price= price || product.price ;
                product.description = description || product.description;
                product.image= image || product.image;
                product.countInStock= countInStock || product.countInStock;

                const updatedProduct = await product.save();
                res.json(updatedProduct);
        } else {       
                res.status(404);
                throw new Error("Product not found");
        }
    })
)

// CREATE PRODUCT
productRouter.post(
    "/",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { name, price, description, image, countInStock} = req.body;
        const productExist = await Product.findOne({ name });

        if(productExist){
           res.status(400);
           throw new Error(" Product name already exist");
        } else {
            const product = new Product({
                name,
                price,
                description,
                image,
                countInStock,
                user: req.user._id,
            })
            if (product) {
                const updatedProduct = await product.save();
                res.json(updatedProduct);
            }

        }
    })
);

// DELETE PRODUCT
productRouter.post(
    "/jjj",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { name, price, description, image, countInStock} = req.body;
        const productExist = await Product.findOne(name);
        if(productExist){
            res.status(400);
            throw new Error("Product name already exist");
        } else {
            const product = new Product({
                name,
                price,
                description,
                image,
                countInStock,
                usr: req.user._id,  
            })    
        }
    })
);


export default productRouter;