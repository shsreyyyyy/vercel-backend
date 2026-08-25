import mongoose from "mongoose";
 
const cartSchema=mongoose.Schema(
    {
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
        unique:true
    },
    items:[{
        productId:{
            type:String,
            require:true,
        },
        name:{
            type:String,
            require:true
        },
        image:{
            type:String,
            default:""
        },
        description:{
            type:String,   
        },
        category:{
            type:String,
            require:true
        },
        price:{
            type:Number,
            require:true
        },
        quantity:{
            type:Number,
            default:1,
            min:1
        }
    }
]

},{timestamps:true}
);

export const Cart=mongoose.model("Cart",cartSchema)