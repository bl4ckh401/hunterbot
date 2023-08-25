import { Model, model, Schema, Document } from "mongoose";

interface Attrs {
    tokenAddress: string;
    pairAddress: string;
    tokenName: string;
    pairedWith: string
}

interface TokenModel extends Model<TokenDoc> {
    build(attrs: Attrs): TokenDoc;
}

interface TokenDoc extends Document {
    tokenAddress: string;
    pairAddress: string;
    tokenName: string;
    pairedWith: string
}

const TokenSchema = new Schema(
    {
      value: { type: Number },
      tokenAddress: { type: String },
      pairAddress: { type: String },
      tokenName: { type: String },
      pairedWith: { type: String },
      timestamp: { type: Schema.Types.Date, default: Date.now },
    },
    {
      toJSON: {
        virtuals: true,
        transform(doc, ret) {
          ret.id = ret._id;
          delete ret._id;
        },
        versionKey: false,
      },
    }
  );

TokenSchema.statics.build = (attrs: Attrs) => {
    return new Token(attrs);
};

const Token = model<TokenDoc, TokenModel>("Tokens", TokenSchema);
export { Token, TokenDoc };
  