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
        const sampleMessage = new Message({
            title: 'myMessage',
            body: 'Body of myMessage'
        })
        sampleUser.save()
        .then( () => {
            sampleMessage.author = sampleUser
            return sampleMessage.save()
        })
        .then(() => {
            sampleUser.messages.unshift(sampleMessage)
            return sampleUser.save()
        })
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
        .catch((err) => {
            console.log(err)
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
        Message.findOne({title:'myMessage'})
        .then((message) => {
            chai.request(app)
            .get(`/messages/${message._id}`)
            .end((err, res) => {
                if (err) { done(err) }
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body.title).to.equal('myMessage')
                expect(res.body.body).to.equal('Body of myMessage')
                done()
            })
        })
        
        
        
    })

    it('should post a new message', (done) => {
        User.findOne({username: 'myuser'})
        .then((user) => {
            chai.request(app)
            .post('/messages')
            .send({title: 'New message title', body: 'New body', author: user })
            .end( (err, res) => {
                if(err) { done(err) 
                } else {
                    expect(res.body.title).to.be.equal('New message title')
                    expect(res.body).to.be.an('object')
                    Message.findOne({title: 'New message title'})
                    .then( (message) => {
                        expect(message).to.be.an('object')
                        done()
                    })
                }
            })
        })
        .catch(err => {
            throw err.message
        })
    })

     it('should update a message', (done) => {
        Message.findOne({title: 'myMessage'})
        .then( (message) => {
            chai.request(app)
            .put(`/messages/${message._id}`)
            .send({title: 'Updated myMessage'})
            .end( (err, res) => {
                if (err) {
                    done(err)
                } else { 
                    expect(res.body.updatedMessage.title).to.be.equal('Updated myMessage')
                    expect(res.body.updatedMessage).to.be.an('object')

                    //ensure it was updated in db
                    Message.findOne({title: 'Updated myMessage'})
                    .then( (message) => {
                        expect(message.title).to.be.equal('Updated myMessage')
                        done()
                    })
                }
            })
        })
    })

    it('should delete a message', (done) => {
        Message.findOne({title: 'myMessage'})
        .then((message) => {
            chai.request(app)
            .delete(`/messages/${message._id}`)
            .end((err, res) => {
                if (err) {
                    done(err)
                } else {
                    expect(res.body.message).to.equal('Successfully deleted.')
                    //make sure its not in db anymore
                    Message.findOne({title: 'myMessage' })
                    .then((message) => {
                        expect(message).to.equal(null)
                        done()
                    })
                    
                }
            })
        })
        
    })
})
