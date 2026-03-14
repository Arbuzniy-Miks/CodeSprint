const prisma = require('./prisma.service');

class DocumentService {
  async createDocumentRecord(file) {
    try {
      console.log('📝 Creating document record for:', file.originalname);
      
      const document = await prisma.document.create({
        data: {
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          extension: file.originalname.split('.').pop(),
          size: file.size,
          filePath: file.path,
          fileUrl: `/uploads/${file.filename}`,
          status: 'uploaded'
        }
      });
      
      console.log('✅ Document created with ID:', document.id);
      return document;
    } catch (error) {
      console.error('❌ Error creating document record:', error);
      throw error;
    }
  }

  async getDocumentById(id) {
    return prisma.document.findUnique({
      where: { id },
      include: { questions: true }
    });
  }

  async getAllDocuments() {
    return prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: { questions: true }
    });
  }

  async updateDocumentStatus(id, status, extractedText = null) {
    return prisma.document.update({
      where: { id },
      data: {
        status,
        extractedText,
        updatedAt: new Date()
      }
    });
  }
}

module.exports = new DocumentService();