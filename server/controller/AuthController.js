import bycrypt from 'bcryptjs';    // for password hashing
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client'; // DB access

const prisma = new PrismaClient(); // Create Prisma instance

//REGISTER USER
const register = async (req, res) => {
    //Check content type
    if (req.get('Content-Type') !== 'application/json') {
        return res.status(400).json({message: 'Content-Type must be application/json'});
    }
    //Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({message: 'Request body is required'});
    }

    try {
        //validate input
       const requiredFields = ['name', 'email', 'password', 'confirmPassword', 'role'];
       const { name, email, password, confirmPassword, role } = req.body;

        for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({ error: `${field} is required.` });
        }
        }

        //Validate password length
        if (password.length < 6) {
            return res.status(400).json({message: 'Password must be at least 6 characters long'});
        }
        if (password !== confirmPassword) {
            return res.status(400).json({message: 'Passwords do not match'});
        }
        
        //Validate role(optional defaults to Employee)
        const validRoles = ['EMPLOYEE', 'ADMIN'];
        const userRole = validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'EMPLOYEE';

        
        //Check if user already exists
        const existingUser = await prisma.user.findUnique({where: {email}});
        if (existingUser) {
            return res.status(400).json({message: 'User already exists'});
        }

        //Hash password
        const hashedPassword = await bycrypt.hash(password, 10);

        //Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: userRole
            }
        });
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({message: 'Internal server error'});
    }
};
// LOGIN
const login = async (req, res) => {
  // Check content type
  if (req.get('Content-Type') !== 'application/json') {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  // Check if request body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body is required' });
  }

  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

  
    // Check user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bycrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT with role
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('Generated token for user:', { userId: user.id, role: user.role });

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token // Also return token for frontend storage (optional)
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
// LOGOUT
const logout = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('[LOGOUT ERROR]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//getme
//uses the JWT token to return the current user's info.
//GET api/auth/me

const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('[GET ME ERROR]', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ADMIN: list all users
const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: users });
  } catch (error) {
    console.error('[LIST USERS ERROR]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export { register, login, logout, getMe, listUsers};