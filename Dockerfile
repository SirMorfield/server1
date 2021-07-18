FROM node:14

USER nodejs
WORKDIR /home/nodejs/
EXPOSE 8080

RUN chown -R nodejs:nodejs .
COPY --chown=nodejs:nodejs . .
RUN npm install
RUN tsc

ENTRYPOINT [ "npm", "run", "start" ]
