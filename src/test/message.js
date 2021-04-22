require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert

const User = require('../models/user.js')
const Message = require('../models/message.js')

chai.config.includeStack = true

const expect = chai.expect
const should = chai.should()
chai.use(chaiHttp)

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {}
  mongoose.modelSchemas = {}
  mongoose.connection.close()
  done()
})

describe('Message API endpoints', () => {
    beforeEach((done) => {
        // TODO: add any beforeEach code here
        //create a user to author the test message
        //create a message to use for message endpoints
        const sampleUser = new User({
            username: 'myuser',
            password: 'mypassword'
        })
        sampleUser.save()
        const sampleMessage = new Message({
            title: 'myMessage',
            body: 'Body of myMessage',
            author: sampleUser._id
        })
        sampleMessage.save()
        .then(() => {
            done()
        })
    })

    afterEach((done) => {
        User.deleteMany({ username: ['myuser'] })
        Message.deleteMany({ title: ['myMessage'] })
        .then(() => {
            done()
        })   
    })

    it('should load all messages', (done) => {
        chai.request(app)
        .get('/messages')
        .end((err, res) => {
            if (err) { done(err) }
            expect(res).to.have.status(200)
            expect(res.body.messages).to.be.an("array")
            done();
        })
    })

    it('should get one specific message', (done) => {
        const sampleMessage = Message.findOne({title:'myMessage'})
        chai.request(app)
        .get(`/messages/${sampleMessage._id}`)
        .end((err, res) => {
            if (err) { done(err) }
            expect(res).to.have.status(200)
            expect(res.body).to.be.an('object')
            expect(res.body.title).to.equal('myMessage')
            expect(res.body.body).to.equal('Body of myMessage')
        })
        done()
    })

    it('should post a new message', (done) => {
        // TODO: Complete this
        done()
    })

    it('should update a message', (done) => {
        // TODO: Complete this
        done()
    })

    it('should delete a message', (done) => {
        // TODO: Complete this
        done()
    })
})
