import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql"
import { prisma } from "../root.js"
import { messageType, messageWithTokenType } from "../types/message.js"
import bcrypt from 'bcrypt'
import tokenSign from "../../utilities/jwt.js"

const saltRounds = 10
const unmtachError = (ctx) => ctx.throw('$$$Имэйл эсвэл нууц үг буруу байна.')

export const signUpUser = {
   type: messageWithTokenType,
   args: {
      name: { type: GraphQLString },
      email: { type: GraphQLString },
      password: { type: GraphQLString }
   },
   async resolve(parent, args, ctx) {
      let user = await prisma.user.findFirst({
         where: {
            email: args.email
         }
      })

      if (user) {
         ctx.throw('$$$Имэйл хаяг бүртгэлтэй байна.')
      }

      const hash = await bcrypt.hash(args.password, saltRounds)
      args.password = hash
      user = await prisma.user.create({
         data: args
      })

      const token = tokenSign({ user: user.name })

      return {
         message: 'Хэрэглэгч бүртгүүллээ.',
         token: token
      }
   }
}

export const loginUser = {
   type: messageWithTokenType,
   args: {
      email: { type: GraphQLString },
      password: { type: GraphQLString }
   },
   async resolve(parent, args, ctx) {
      if (!args.email) ctx.throw('$$$Имэйл хаягаараа нэвтэрнэ үү.')
      if (!args.password) ctx.throw('$$$Нууц үгээ оруулна уу.')

      const user = await prisma.user.findFirst({
         where: {
            email: args.email
         }
      })

      if (!user) {
         unmtachError(ctx)
      }

      const match = await bcrypt.compare(args.password, user.password)
      if (!match) {
         unmtachError(ctx)
      }

      const token = tokenSign({ user: user.name })

      return {
         message: 'Хэрэглэгч нэвтэрлээ.',
         token: token
      }
   }
}

export const changePassword = {
   type: messageType,
   args: {
      id: { type: GraphQLID },
      oldPassword: { type: GraphQLString },
      newPassword: { type: GraphQLString }
   },
   async resolve(parent, args, ctx) {
      return { message: 'Нууц үг солигдлоо.' }
   },
}
