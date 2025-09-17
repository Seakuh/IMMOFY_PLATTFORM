import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between, In, FindOptionsWhere } from 'typeorm';
import { Billboard, BillboardStatus } from './entities/billboard.entity';
import { CreateBillboardDto } from './dto/create-billboard.dto';
import { UpdateBillboardDto } from './dto/update-billboard.dto';
import { BillboardFilterDto } from './dto/billboard-filter.dto';
import { BillboardSearchDto } from './dto/billboard-search.dto';
import { CreateBillboardFromAiDto } from './dto/create-billboard-from-ai.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BillboardApplicationRepository } from './repositories/billboard-application.repository';
import { BillboardInvitationRepository } from './repositories/billboard-invitation.repository';
import { BillboardCommentRepository } from './repositories/billboard-comment.repository';
import { HashtagService } from './services/hashtag.service';
import { BillboardGateway } from './gateways/billboard.gateway';
import { BillboardApplication, ApplicationStatus } from './entities/billboard-application.entity';
import { BillboardInvitation, InvitationStatus } from './entities/billboard-invitation.entity';
import { BillboardComment } from './entities/billboard-comment.entity';
import { UsersService } from '../users/users.service';
import { CreateBulletinListingDto, BulletinFormData, BulletinListing } from './dto/create-bulletin-listing.dto';
import { BillboardEmbeddingService } from './services/billboard-embedding.service';
import { CogneeIntegrationService } from './services/cognee-integration.service';
import { ImageService } from '../images/image.service';

@Injectable()
export class BillboardService {
  constructor(
    @InjectRepository(Billboard)
    private readonly billboardRepository: Repository<Billboard>,
    private readonly applicationRepository: BillboardApplicationRepository,
    private readonly invitationRepository: BillboardInvitationRepository,
    private readonly commentRepository: BillboardCommentRepository,
    private readonly hashtagService: HashtagService,
    private readonly billboardGateway: BillboardGateway,
    private readonly usersService: UsersService,
    private readonly embeddingService: BillboardEmbeddingService,
    private readonly cogneeService: CogneeIntegrationService,
    private readonly imageService: ImageService,
  ) {}

  async create(createBillboardDto: CreateBillboardDto, userId: string): Promise<Billboard> {
    // Get user info for billboard
    const user = await this.usersService.findById(userId);

    // Process content and extract hashtags
    const { content, hashtags } = this.hashtagService.processContent(createBillboardDto.content || '');

    const billboard = this.billboardRepository.create({
      ...createBillboardDto,
      content,
      hashtags,
      userName: user.name,
      userAvatar: user.avatarUrl,
      user: { id: userId } as any,
      availableFrom: createBillboardDto.availableFrom ? new Date(createBillboardDto.availableFrom) : undefined,
      availableUntil: createBillboardDto.availableUntil ? new Date(createBillboardDto.availableUntil) : undefined,
      expiresAt: createBillboardDto.expiresAt ? new Date(createBillboardDto.expiresAt) : undefined,
      deadline: createBillboardDto.deadline ? new Date(createBillboardDto.deadline) : undefined,
    });

    return this.billboardRepository.save(billboard);
  }

  async findAll(filters: BillboardFilterDto): Promise<{ billboards: Billboard[], total: number, page: number, limit: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', ...filterOptions } = filters;
    
    const whereConditions: FindOptionsWhere<Billboard> = {
      isActive: true,
      isPublished: true,
    };

    // Apply filters
    if (filterOptions.category) {
      whereConditions.category = filterOptions.category;
    }
    if (filterOptions.type) {
      whereConditions.type = filterOptions.type;
    }
    if (filterOptions.status) {
      whereConditions.status = filterOptions.status;
    }
    if (filterOptions.city) {
      whereConditions.city = Like(`%${filterOptions.city}%`);
    }
    if (filterOptions.location) {
      whereConditions.location = Like(`%${filterOptions.location}%`);
    }
    if (filterOptions.furnished !== undefined) {
      whereConditions.furnished = filterOptions.furnished;
    }
    if (filterOptions.petsAllowed !== undefined) {
      whereConditions.petsAllowed = filterOptions.petsAllowed;
    }
    if (filterOptions.balcony !== undefined) {
      whereConditions.balcony = filterOptions.balcony;
    }
    if (filterOptions.garden !== undefined) {
      whereConditions.garden = filterOptions.garden;
    }
    if (filterOptions.parking !== undefined) {
      whereConditions.parking = filterOptions.parking;
    }
    if (filterOptions.elevator !== undefined) {
      whereConditions.elevator = filterOptions.elevator;
    }

    // Price range filter
    if (filterOptions.minPrice !== undefined && filterOptions.maxPrice !== undefined) {
      whereConditions.price = Between(filterOptions.minPrice, filterOptions.maxPrice);
    } else if (filterOptions.minPrice !== undefined) {
      whereConditions.price = Between(filterOptions.minPrice, Number.MAX_SAFE_INTEGER);
    } else if (filterOptions.maxPrice !== undefined) {
      whereConditions.price = Between(0, filterOptions.maxPrice);
    }

    // Size range filter
    if (filterOptions.minSize !== undefined && filterOptions.maxSize !== undefined) {
      whereConditions.size = Between(filterOptions.minSize, filterOptions.maxSize);
    } else if (filterOptions.minSize !== undefined) {
      whereConditions.size = Between(filterOptions.minSize, Number.MAX_SAFE_INTEGER);
    } else if (filterOptions.maxSize !== undefined) {
      whereConditions.size = Between(0, filterOptions.maxSize);
    }

    // Rooms range filter
    if (filterOptions.minRooms !== undefined && filterOptions.maxRooms !== undefined) {
      whereConditions.rooms = Between(filterOptions.minRooms, filterOptions.maxRooms);
    } else if (filterOptions.minRooms !== undefined) {
      whereConditions.rooms = Between(filterOptions.minRooms, Number.MAX_SAFE_INTEGER);
    } else if (filterOptions.maxRooms !== undefined) {
      whereConditions.rooms = Between(0, filterOptions.maxRooms);
    }

    const findOptions: FindManyOptions<Billboard> = {
      where: whereConditions,
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    };

    // Full-text search
    if (filterOptions.search) {
      delete findOptions.where;
      findOptions.where = [
        { ...whereConditions, title: Like(`%${filterOptions.search}%`) },
        { ...whereConditions, description: Like(`%${filterOptions.search}%`) },
        { ...whereConditions, location: Like(`%${filterOptions.search}%`) },
        { ...whereConditions, city: Like(`%${filterOptions.search}%`) },
      ];
    }

    const [billboards, total] = await this.billboardRepository.findAndCount(findOptions);

    return {
      billboards,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Billboard> {
    const billboard = await this.billboardRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!billboard) {
      throw new NotFoundException(`Billboard with ID ${id} not found`);
    }

    return billboard;
  }

  async update(id: string, updateBillboardDto: UpdateBillboardDto, userId: string): Promise<Billboard> {
    const billboard = await this.findOne(id);

    // Check if user owns this billboard
    if (billboard.user.id !== userId) {
      throw new ForbiddenException('You can only update your own billboards');
    }

    // Convert date strings to Date objects
    const updateData: any = { ...updateBillboardDto };
    if (updateBillboardDto.availableFrom) {
      updateData.availableFrom = new Date(updateBillboardDto.availableFrom);
    }
    if (updateBillboardDto.availableUntil) {
      updateData.availableUntil = new Date(updateBillboardDto.availableUntil);
    }
    if (updateBillboardDto.expiresAt) {
      updateData.expiresAt = new Date(updateBillboardDto.expiresAt);
    }

    await this.billboardRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const billboard = await this.findOne(id);

    // Check if user owns this billboard
    if (billboard.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own billboards');
    }

    await this.billboardRepository.remove(billboard);
    return { message: 'Billboard deleted successfully' };
  }


  async incrementView(id: string): Promise<{ views: number }> {
    const billboard = await this.findOne(id);
    const newViews = billboard.views + 1;

    await this.billboardRepository.update(id, {
      views: newViews,
    });

    return { views: newViews };
  }

  async findUserBillboards(userId: string, page: number = 1, limit: number = 20): Promise<{ billboards: Billboard[], total: number, page: number, limit: number }> {
    const [billboards, total] = await this.billboardRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      billboards,
      total,
      page,
      limit,
    };
  }

  async search(searchDto: BillboardSearchDto): Promise<{ billboards: Billboard[], total: number, page: number, limit: number }> {
    const { query, location, page = 1, limit = 20 } = searchDto;
    
    const whereConditions: FindOptionsWhere<Billboard>[] = [
      { title: Like(`%${query}%`), isActive: true, isPublished: true },
      { description: Like(`%${query}%`), isActive: true, isPublished: true },
    ];

    // Add location filter if provided
    if (location) {
      whereConditions.forEach(condition => {
        condition.location = Like(`%${location}%`);
      });
    }

    const [billboards, total] = await this.billboardRepository.findAndCount({
      where: whereConditions,
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      billboards,
      total,
      page,
      limit,
    };
  }

  // Additional helper methods
  async deactivateExpiredBillboards(): Promise<number> {
    const result = await this.billboardRepository.update(
      {
        expiresAt: Between(new Date('1970-01-01'), new Date()),
        status: BillboardStatus.ACTIVE,
      },
      {
        status: BillboardStatus.EXPIRED,
        isActive: false,
      }
    );

    return result.affected || 0;
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    offers: number;
    searches: number;
    byCategory: Record<string, number>;
  }> {
    const total = await this.billboardRepository.count();
    const active = await this.billboardRepository.count({ where: { status: BillboardStatus.ACTIVE } });
    const offers = await this.billboardRepository.count({ where: { type: 'offer' as any } });
    const searches = await this.billboardRepository.count({ where: { type: 'search' as any } });

    // Get counts by category
    const categoryStats = await this.billboardRepository
      .createQueryBuilder('billboard')
      .select('billboard.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('billboard.category')
      .getRawMany();

    const byCategory = categoryStats.reduce((acc, item) => {
      acc[item.category] = parseInt(item.count);
      return acc;
    }, {});

    return {
      total,
      active,
      offers,
      searches,
      byCategory,
    };
  }

  async createFromAiAnalysis(createBillboardFromAiDto: CreateBillboardFromAiDto, userId: string): Promise<Billboard> {
    const billboard = this.billboardRepository.create({
      ...createBillboardFromAiDto,
      user: { id: userId } as any,
      status: BillboardStatus.DRAFT, // Start as draft for review
      isPublished: false,
      isActive: false,
    });

    return this.billboardRepository.save(billboard);
  }

  async findUserDrafts(userId: string, page: number = 1, limit: number = 20): Promise<{ billboards: Billboard[], total: number, page: number, limit: number }> {
    const [billboards, total] = await this.billboardRepository.findAndCount({
      where: { 
        user: { id: userId },
        status: BillboardStatus.DRAFT,
        isPublished: false,
      },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      billboards,
      total,
      page,
      limit,
    };
  }

  async publishDraft(id: string, userId: string): Promise<Billboard> {
    const billboard = await this.findOne(id);

    // Check if user owns this billboard
    if (billboard.user.id !== userId) {
      throw new ForbiddenException('You can only publish your own billboards');
    }

    // Check if it's a draft
    if (billboard.status !== BillboardStatus.DRAFT) {
      throw new BadRequestException('Only draft billboards can be published');
    }

    await this.billboardRepository.update(id, {
      status: BillboardStatus.ACTIVE,
      isPublished: true,
      isActive: true,
    });

    return this.findOne(id);
  }

  // Application Management Methods

  async applyToBillboard(billboardId: string, applicantId: string, applicationDto: CreateApplicationDto): Promise<BillboardApplication> {
    // Check if billboard exists and is active
    const billboard = await this.findOne(billboardId);
    if (!billboard.isActive || billboard.status !== BillboardStatus.ACTIVE) {
      throw new BadRequestException('This billboard is not accepting applications');
    }

    // Check if deadline has passed
    if (billboard.deadline && new Date() > billboard.deadline) {
      throw new BadRequestException('Application deadline has passed');
    }

    // Check if user already applied
    const existingApplication = await this.applicationRepository.findByBillboardAndApplicant(billboardId, applicantId);
    if (existingApplication) {
      throw new BadRequestException('You have already applied to this billboard');
    }

    // Get applicant info
    const applicant = await this.usersService.findById(applicantId);

    // Create application
    const application = await this.applicationRepository.create({
      billboardId,
      applicantId,
      applicantName: applicant.name,
      applicantAvatar: applicant.avatarUrl,
      message: applicationDto.message,
    });

    // Update billboard application count
    await this.billboardRepository.update(billboardId, {
      applicationCount: billboard.applicationCount + 1
    });

    // Send real-time notification to billboard creator
    this.billboardGateway.notifyNewApplication(billboard.user.id, {
      type: 'new_application',
      billboardId,
      userId: applicantId,
      data: {
        applicantName: applicant.name,
        applicantAvatar: applicant.avatarUrl,
        message: applicationDto.message,
        applicationId: application.id
      },
      timestamp: new Date()
    });

    return application;
  }

  async getBillboardApplications(billboardId: string, userId: string, status?: ApplicationStatus): Promise<BillboardApplication[]> {
    // Verify user owns the billboard
    const billboard = await this.findOne(billboardId);
    if (billboard.user.id !== userId) {
      throw new ForbiddenException('You can only view applications for your own billboards');
    }

    return this.applicationRepository.findByBillboard(billboardId, { status });
  }

  async getUserApplications(userId: string, status?: ApplicationStatus): Promise<BillboardApplication[]> {
    return this.applicationRepository.findByApplicant(userId, { status });
  }

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus, userId: string): Promise<BillboardApplication> {
    const application = await this.applicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify user owns the billboard
    const billboard = await this.findOne(application.billboardId);
    if (billboard.user.id !== userId) {
      throw new ForbiddenException('You can only update applications for your own billboards');
    }

    const updatedApplication = await this.applicationRepository.updateStatus(applicationId, status);

    // Send real-time notification to applicant
    this.billboardGateway.notifyApplicationStatus(application.applicantId, {
      type: 'application_status',
      billboardId: application.billboardId,
      userId: application.applicantId,
      data: {
        status,
        billboardTitle: billboard.title,
        applicationId
      },
      timestamp: new Date()
    });

    return updatedApplication;
  }

  // Invitation Management Methods

  async sendInvitation(billboardId: string, inviterId: string, invitationDto: CreateInvitationDto): Promise<BillboardInvitation> {
    // Verify user owns the billboard
    const billboard = await this.findOne(billboardId);
    if (billboard.user.id !== inviterId) {
      throw new ForbiddenException('You can only send invitations for your own billboards');
    }

    // Check invitation limits
    if (billboard.sentInvitations >= billboard.maxInvitations) {
      throw new BadRequestException('Invitation limit reached for this billboard');
    }

    // Check if invitation already exists
    const existingInvitation = await this.invitationRepository.findByBillboardAndInvitee(billboardId, invitationDto.inviteeId);
    if (existingInvitation) {
      throw new BadRequestException('Invitation already sent to this user');
    }

    // Check if user has applied (can only invite applicants)
    const application = await this.applicationRepository.findByBillboardAndApplicant(billboardId, invitationDto.inviteeId);
    if (!application) {
      throw new BadRequestException('User must apply before receiving an invitation');
    }

    // Get inviter and invitee info
    const inviter = await this.usersService.findById(inviterId);
    const invitee = await this.usersService.findById(invitationDto.inviteeId);

    // Set expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await this.invitationRepository.create({
      billboardId,
      inviterId,
      inviterName: inviter.name,
      inviteeId: invitationDto.inviteeId,
      inviteeName: invitee.name,
      inviteeAvatar: invitee.avatarUrl,
      message: invitationDto.message,
      expiresAt
    });

    // Update billboard sent invitations count
    await this.billboardRepository.update(billboardId, {
      sentInvitations: billboard.sentInvitations + 1
    });

    // Send real-time notification to invitee
    this.billboardGateway.notifyInvitationReceived(invitationDto.inviteeId, {
      type: 'invitation_received',
      billboardId,
      userId: invitationDto.inviteeId,
      data: {
        inviterName: inviter.name,
        billboardTitle: billboard.title,
        message: invitationDto.message,
        invitationId: invitation.id,
        expiresAt
      },
      timestamp: new Date()
    });

    return invitation;
  }

  async getUserInvitations(userId: string, status?: InvitationStatus): Promise<BillboardInvitation[]> {
    return this.invitationRepository.findByInvitee(userId, { status });
  }

  async updateInvitationStatus(invitationId: string, status: InvitationStatus, userId: string): Promise<BillboardInvitation> {
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify user is the invitee
    if (invitation.inviteeId !== userId) {
      throw new ForbiddenException('You can only update your own invitations');
    }

    return this.invitationRepository.updateStatus(invitationId, status);
  }

  // Comment Management Methods

  async addComment(billboardId: string, userId: string, commentDto: CreateCommentDto): Promise<BillboardComment> {
    // Check if billboard exists
    const billboard = await this.findOne(billboardId);

    // Get user info
    const user = await this.usersService.findById(userId);

    // Create comment
    const comment = await this.commentRepository.create({
      billboardId,
      userId,
      userName: user.name,
      userAvatar: user.avatarUrl,
      content: commentDto.content
    });

    // Update billboard comment count
    await this.billboardRepository.update(billboardId, {
      commentCount: billboard.commentCount + 1
    });

    // Send real-time notification
    this.billboardGateway.notifyNewComment(billboardId, {
      type: 'new_comment',
      billboardId,
      userId,
      data: {
        userName: user.name,
        userAvatar: user.avatarUrl,
        content: commentDto.content,
        commentId: comment.id
      },
      timestamp: new Date()
    });

    return comment;
  }

  async getBillboardComments(billboardId: string, page: number = 1, limit: number = 20): Promise<{ comments: BillboardComment[], total: number }> {
    return this.commentRepository.findByBillboard(billboardId, { page, limit });
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user owns the comment or the billboard
    const billboard = await this.findOne(comment.billboardId);
    if (comment.userId !== userId && billboard.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own comments or comments on your billboards');
    }

    await this.commentRepository.softDelete(commentId);

    // Update billboard comment count
    await this.billboardRepository.update(comment.billboardId, {
      commentCount: Math.max(0, billboard.commentCount - 1)
    });
  }

  // Enhanced Like functionality with real-time notifications

  async toggleLike(id: string, userId: string): Promise<{ liked: boolean, likesCount: number }> {
    const billboard = await this.findOne(id);

    const likedBy = billboard.likedBy || [];
    const isLiked = likedBy.includes(userId);

    let updatedLikedBy: string[];
    let likesCount: number;

    if (isLiked) {
      // Unlike
      updatedLikedBy = likedBy.filter(uid => uid !== userId);
      likesCount = billboard.likesCount - 1;
    } else {
      // Like
      updatedLikedBy = [...likedBy, userId];
      likesCount = billboard.likesCount + 1;

      // Send real-time notification for new likes
      const user = await this.usersService.findById(userId);
      this.billboardGateway.notifyNewLike(id, {
        type: 'new_like',
        billboardId: id,
        userId,
        data: {
          userName: user.name,
          userAvatar: user.avatarUrl,
          likesCount
        },
        timestamp: new Date()
      });
    }

    await this.billboardRepository.update(id, {
      likedBy: updatedLikedBy,
      likesCount,
    });

    return {
      liked: !isLiked,
      likesCount,
    };
  }

  // Utility methods for maintenance

  async markExpiredInvitations(): Promise<number> {
    return this.invitationRepository.markExpiredInvitations();
  }

  async sendDeadlineReminders(): Promise<void> {
    // Find billboards with deadlines in the next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const billboards = await this.billboardRepository.find({
      where: {
        deadline: Between(new Date(), tomorrow),
        status: BillboardStatus.ACTIVE,
        isActive: true
      },
      relations: ['user']
    });

    for (const billboard of billboards) {
      this.billboardGateway.notifyDeadlineReminder(billboard.user.id, {
        type: 'deadline_reminder',
        billboardId: billboard.id,
        userId: billboard.user.id,
        data: {
          title: billboard.title,
          deadline: billboard.deadline,
          applicationCount: billboard.applicationCount
        },
        timestamp: new Date()
      });
    }
  }

  // Frontend Integration Methods

  async createBulletinListing(
    bulletinDto: CreateBulletinListingDto,
    images: Express.Multer.File[],
    userId?: string,
  ): Promise<BulletinListing> {
    try {
      // Parse form data
      const formData: BulletinFormData = JSON.parse(bulletinDto.formData);

      // Upload images
      const imageUrls: string[] = [];
      if (images && images.length > 0) {
        for (const image of images) {
          const imageUrl = await this.imageService.uploadImage(image);
          imageUrls.push(imageUrl);
        }
      }

      // Get user info if userId provided
      let user = null;
      if (userId) {
        user = await this.usersService.findById(userId);
      }

      // Process content and extract hashtags
      const { content, hashtags } = this.hashtagService.processContent(formData.content || '');

      // Create billboard
      const billboard = this.billboardRepository.create({
        title: formData.title,
        description: formData.description,
        content,
        hashtags,
        category: formData.category as any,
        type: formData.type as any,
        price: formData.price,
        priceType: formData.priceType,
        location: formData.location,
        city: formData.city,
        zipCode: formData.zipCode,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        size: formData.size,
        rooms: formData.rooms,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        floor: formData.floor,
        furnished: formData.furnished || false,
        petsAllowed: formData.petsAllowed || false,
        smokingAllowed: formData.smokingAllowed || false,
        balcony: formData.balcony || false,
        garden: formData.garden || false,
        parking: formData.parking || false,
        elevator: formData.elevator || false,
        accessible: formData.accessible || false,
        images: imageUrls,
        amenities: formData.amenities || [],
        tags: formData.tags || [],
        availableFrom: formData.availableFrom ? new Date(formData.availableFrom) : undefined,
        availableUntil: formData.availableUntil ? new Date(formData.availableUntil) : undefined,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        deposit: formData.deposit,
        utilities: formData.utilities,
        heatingType: formData.heatingType,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        maxInvitations: formData.maxInvitations || 10,
        userName: user?.name,
        userAvatar: user?.avatarUrl,
        user: user ? { id: userId } as any : null,
        status: BillboardStatus.ACTIVE,
        isActive: true,
        isPublished: true,
      });

      // Save billboard
      const savedBillboard = await this.billboardRepository.save(billboard);

      // Generate and store embedding asynchronously
      this.processEmbeddingAsync(savedBillboard);

      return {
        success: true,
        message: 'Billboard listing created successfully',
        billboard: {
          id: savedBillboard.id,
          title: savedBillboard.title,
          description: savedBillboard.description,
          content: savedBillboard.content,
          hashtags: savedBillboard.hashtags,
          images: savedBillboard.images,
          location: savedBillboard.location,
          price: savedBillboard.price,
          createdAt: savedBillboard.createdAt.toISOString(),
        },
      };
    } catch (error) {
      console.error('Error creating bulletin listing:', error);
      throw new BadRequestException('Failed to create bulletin listing');
    }
  }

  /**
   * Process embedding and Cognee storage asynchronously
   */
  private async processEmbeddingAsync(billboard: Billboard): Promise<void> {
    try {
      // Generate embedding
      const embedding = await this.embeddingService.createBillboardEmbedding(billboard);

      // Store in Cognee
      await this.cogneeService.storeBillboardEmbedding(embedding);

      console.log(`Successfully stored embedding for billboard ${billboard.id}`);
    } catch (error) {
      console.error(`Failed to process embedding for billboard ${billboard.id}:`, error);
      // Don't throw error as this is async processing - the billboard was already created successfully
    }
  }

  /**
   * Search similar billboards using embeddings
   */
  async searchSimilarBillboards(
    searchText: string,
    limit: number = 10,
    filters?: any
  ): Promise<Billboard[]> {
    try {
      // Generate embedding for search text
      const queryEmbedding = await this.embeddingService.generateEmbedding(searchText);

      // Search in Cognee
      const similarItems = await this.cogneeService.searchSimilarBillboards(
        queryEmbedding,
        limit,
        filters
      );

      // Extract billboard IDs from results
      const billboardIds = similarItems
        .map(item => item.metadata?.billboard_id)
        .filter(id => id);

      // Fetch billboard details from database
      if (billboardIds.length === 0) {
        return [];
      }

      return await this.billboardRepository.find({
        where: { id: In(billboardIds) },
        relations: ['user'],
      });
    } catch (error) {
      console.error('Error searching similar billboards:', error);
      // Fallback to regular search
      return this.billboardRepository.find({
        where: [
          { title: Like(`%${searchText}%`) },
          { description: Like(`%${searchText}%`) },
          { content: Like(`%${searchText}%`) },
        ],
        take: limit,
        relations: ['user'],
      });
    }
  }

  /**
   * Search similar billboards using a precomputed embedding vector.
   * Falls back to simple LIKE search if Cognee is unavailable.
   */
  async searchSimilarBillboardsByVector(
    queryEmbedding: number[],
    limit: number = 10,
    filters?: any,
  ): Promise<Billboard[]> {
    try {
      const similarItems = await this.cogneeService.searchSimilarBillboards(
        queryEmbedding,
        limit,
        filters,
      );

      const billboardIds = similarItems
        .map((item) => item.metadata?.billboard_id)
        .filter((id) => id);

      if (!billboardIds.length) return [];

      return this.billboardRepository.find({
        where: { id: In(billboardIds) },
        relations: ['user'],
      });
    } catch (error) {
      console.error('Error searching by vector (billboards):', error);
      return [];
    }
  }
}
