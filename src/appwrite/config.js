import config from '../config/config.js';
import { Client, Databases, Storage, ID, Query } from "appwrite";

export class Service {
  client = new Client();
  databases;
  bucket;

  constructor(){
    this.client
      .setEndpoint(config.appwriteUrl)
      .setProject(config.appwriteProjectId);
    this.databases = new Databases(this.client);
    this.bucket    = new Storage(this.client);
  }

  async createPost({ title, slug, content, featuredImage, status, userId }) {
    try {
      return await this.databases.createDocument({
        databaseId   : config.appwriteDatabaseId,
        collectionId : config.appwriteCollectionId,
        documentId   : slug,            // if you want custom ID; else use ID.unique()
        data         : { title, content, featuredImage, status, userId }
        // permissions?: [...] if needed
      });
    } catch (error) {
      console.log("Appwrite service :: createPost :: error", error);
      throw error;
    }
  }

  async updatePost(slug, { title, content, featuredImage, status }) {
    try {
      return await this.databases.updateDocument({
        databaseId   : config.appwriteDatabaseId,
        collectionId : config.appwriteCollectionId,
        documentId   : slug,
        data         : { title, content, featuredImage, status }
      });
    } catch (error) {
      console.log("Appwrite service :: updatePost :: error", error);
      throw error;
    }
  }

  async deletePost(slug) {
    try {
      await this.databases.deleteDocument({
        databaseId   : config.appwriteDatabaseId,
        collectionId : config.appwriteCollectionId,
        documentId   : slug
      });
      return true;
    } catch (error) {
      console.log("Appwrite service :: deletePost :: error", error);
      return false;
    }
  }

  async getPost(slug) {
    try {
      return await this.databases.getDocument({
        databaseId   : config.appwriteDatabaseId,
        collectionId : config.appwriteCollectionId,
        documentId   : slug
      });
    } catch (error) {
      console.log("Appwrite service :: getPost :: error", error);
      return null;
    }
  }

  async getPosts(queries = [ Query.equal("status", "active") ]) {
    try {
      return await this.databases.listDocuments({
        databaseId   : config.appwriteDatabaseId,
        collectionId : config.appwriteCollectionId,
        queries
      });
    } catch (error) {
      console.log("Appwrite service :: getPosts :: error", error);
      return null;
    }
  }

  async uploadFile(file) {
    try {
      return await this.bucket.createFile({
        bucketId : config.appwriteBucketId,
        fileId   : ID.unique(),
        file
      });
    } catch (error) {
      console.log("Appwrite service :: uploadFile :: error", error);
      return null;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.bucket.deleteFile({
        bucketId : config.appwriteBucketId,
        fileId
      });
      return true;
    } catch (error) {
      console.log("Appwrite service :: deleteFile :: error", error);
      return false;
    }
  }

  async getFileViewUrl(fileId) {
    try {
      const result = await this.bucket.getFileView({
        bucketId : config.appwriteBucketId,
        fileId
      });
      return result.href;  // may be .href depending on SDK
    } catch (error) {
      console.log("Appwrite service :: getFileViewUrl :: error", error);
      return null;
    }
  }

  async getFilePreviewUrl(fileId, options = {}) {
    try {
      const result = await this.bucket.getFilePreview({
        bucketId : config.appwriteBucketId,
        fileId,
        ...options   // width, height, gravity, quality etc
      });
      return result.href;  // or a Blob / buffer per version
    } catch (error) {
      console.log("Appwrite service :: getFilePreviewUrl :: error", error);
      return null;
    }
  }
}

const service = new Service();
export default service;
