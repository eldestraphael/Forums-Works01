FROM node
WORKDIR /usr/src/app
COPY package.json .
RUN node --version
RUN npm install
COPY . .
RUN npx prisma migrate dev
RUN npx prisma db seed -- --environment develop
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
