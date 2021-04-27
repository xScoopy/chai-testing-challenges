const express = require('express')
const router = express.Router();

const User = require('../models/user')
const Message = require('../models/message')

/** Route to get all messages. */
router.get('/', (req, res) => {
    Message.find().then((messages) => {
        return res.json({messages})
    })
    .catch((err) => {
        throw err.message
    })
})

/** Route to get one message by id. */
router.get('/:messageId', (req, res) => {
    Message.findOne({_id: req.params.messageId})
    .then(result => {
        res.json(result)
    }).catch(err => {
        throw err.message
    })
})

/** Route to add a new message. */
router.post('/', (req, res) => {
    let message = new Message(req.body)
    message.save()
        .then(message => {
            return User.findById(message.author)
        })
        .then(user => {
            // console.log(user)
            user.messages.unshift(message)
            return user.save()
        })
        .then(() => {
            return res.send(message)
        }).catch(err => {
            throw err.message
        })
})

/** Route to update an existing message. */
router.put('/:messageId', (req, res) => {
    // TODO: Update the matching message using `findByIdAndUpdate`
    Message.findByIdAndUpdate(req.params.messageId, req.body)
    .then(() => {
        return Message.findOne({_id: req.params.messageId})
    }).then((updatedMessage) => {
        return res.json({updatedMessage})
    }).catch((err) => {
        throw err.message
    })
})

/** Route to delete a message. */
router.delete('/:messageId', (req, res) => {
    Message.findByIdAndDelete(req.params.messageId)
    .then((result) => {
        if (result === null) {
            return res.json({message: 'User does not exist.'})
        } else {
            User.findOne({_id: result.author})
            .then((user) => {
                let messageDelete = user.messages.indexOf(result._id)
                user.messages.splice(messageDelete)
                user.save()
            }).then(() => {
                return res.json({
                    'message': 'Successfully deleted.',
                    '_id': req.params.messageId
                })
            })    
        }
    })
    .catch((err) => {
        throw err.message
    })
})

module.exports = router