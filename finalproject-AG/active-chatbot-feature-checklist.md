# Active Chatbot Feature – Step-by-Step Checklist

## Context
This checklist covers the implementation of the "activeChatbot" feature, which allows a human operator to take control of a chat, disabling the chatbot for a specific client, and then manually re-enable it. It includes both development steps and PR/review actions. Each task is designed to be independently testable.

---

## 1. Backend

- [x] **Add `activeChatbot` boolean field to the `client` model (if not present)**
    - Default: `true`
    - Migration created and applied

- [x] **Update clients/customers API responses to include the field**
    - Field should be returned in client/customer API responses by default

- [x] **Update message service to check this flag before responding**
    - [x] Add check for `activeChatbot === false` in the message processing logic
    - [x] If disabled, don't generate a bot response and tag as "Manual Operator Control"
    - [x] Add test cases for this logic in the message service spec

## 2. Frontend

- [x] **Update client interface definitions**
    - [x] Add `activeChatbot` field to all client/customer interfaces 
    - [x] Add handling for this field in the mapping functions

- [x] **Add UI control in chat interface**
    - [x] Toggle switch for enabling/disabling the chatbot in the chat header
    - [x] Visual indicator for chatbot status (active/disabled)
    - [x] Confirmation prompt when disabling for the first time
    - [x] Toast notifications for status changes

- [ ] **Add icon in chat list to show chatbot status**
    - [ ] Visual indicator in the chat list to show which customers have chatbot disabled
    - [ ] Ensure this updates in real-time when changed

## 3. Integration Tests

- [ ] **Test chatbot disabling flow**
    - [ ] Test turning off chatbot and sending a message (should not get automated response)
    - [ ] Test turning on chatbot and sending a message (should get automated response)
    - [ ] Test persistence of setting across page reloads

- [ ] **Test client API**
    - [ ] Test that the field is correctly saved and retrieved
    - [ ] Test defaults work as expected

## 4. Documentation

- [ ] **Update API documentation**
    - [ ] Document the new field in API docs
    - [ ] Include usage examples

- [ ] **Add user documentation**
    - [ ] Screenshots of the feature in action
    - [ ] Usage guidelines and best practices

## PR Checklist

- [x] **Code changes**
    - [x] Backend schema changes with migration
    - [x] Backend controller/service updates
    - [x] Frontend interface updates
    - [x] Frontend UI component changes

- [ ] **Testing**
    - [x] Add unit tests for message service
    - [ ] Add integration tests
    - [ ] Manual testing of the entire flow

- [ ] **Documentation**
    - [ ] Update API documentation
    - [ ] Add user guides if necessary
    - [ ] Add comments for complex logic 