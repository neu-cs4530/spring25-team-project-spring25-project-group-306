import mongoose from 'mongoose';
import supertest from 'supertest';
import { Server, type Socket as ServerSocket } from 'socket.io';
import { createServer } from 'http';
import { io as Client, type Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { app } from '../../app';
import * as messageService from '../../services/message.service';
import * as chatService from '../../services/chat.service';
import * as databaseUtil from '../../utils/database.util';
import * as subforumService from '../../services/subforum.service';
import { DatabaseSubforum } from '../../types/types';
import subforumController from '../../controllers/subforum.controller';

const saveSubforumSpy = jest.spyOn(subforumService, 'saveSubforum');
const updateSubforumByIdSpy = jest.spyOn(subforumService, 'updateSubforumById');
const getSubforumByIdSpy = jest.spyOn(subforumService, 'getSubforumById');
const getAllSubforumsSpy = jest.spyOn(subforumService, 'getAllSubforums');
const deleteSubforumByIdSpy = jest.spyOn(subforumService, 'deleteSubforumById');

describe('Subforum Controller', () => {
    describe('POST /', () => {
        it('should create a new subforum successfully', async () => {
            const subforum = {
                title: 'Test Subforum',
                description: 'A test subforum',
                moderators: ['testmoderator'],
            };

            
        });
    });
});