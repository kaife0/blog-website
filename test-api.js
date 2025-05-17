// A script to check API connections and blog operations
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testBlogAPI() {
  console.log('Testing Blog API...');
  
  try {
    // 1. Test the connection
    console.log('1. Testing connection to API...');
    const healthCheck = await apiClient.get('/');
    console.log('Connection test result:', healthCheck.status === 200 ? 'SUCCESS' : 'FAILED');
    
    // 2. Create a new blog
    console.log('\n2. Creating a new blog...');
    const newBlog = {
      title: 'Test Blog ' + Date.now(),
      content: '<p>This is a test blog created by the API test script.</p>',
      tags: ['test', 'api']
    };
    
    const createResponse = await apiClient.post('/blogs/save-draft', newBlog);
    console.log('Create blog result:', createResponse.status === 201 ? 'SUCCESS' : 'FAILED');
    console.log('Blog ID:', createResponse.data._id);
    
    const blogId = createResponse.data._id;
    
    // 3. Update the blog
    console.log('\n3. Updating the blog...');
    const updateData = {
      title: 'Updated Test Blog ' + Date.now(),
      content: '<p>This content has been updated.</p>',
      tags: ['test', 'api', 'updated']
    };
    
    const updateResponse = await apiClient.put(`/blogs/update/${blogId}`, updateData);
    console.log('Update blog result:', updateResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    
    // 4. Get the blog
    console.log('\n4. Fetching the blog...');
    const getResponse = await apiClient.get(`/blogs/${blogId}`);
    console.log('Get blog result:', getResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    console.log('Blog title:', getResponse.data.title);
    
    // 5. Publish the blog
    console.log('\n5. Publishing the blog...');
    const publishResponse = await apiClient.post('/blogs/publish', {
      id: blogId,
      title: getResponse.data.title,
      content: getResponse.data.content,
      tags: getResponse.data.tags
    });
    console.log('Publish blog result:', publishResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    
    // 6. Get all blogs
    console.log('\n6. Fetching all blogs...');
    const getAllResponse = await apiClient.get('/blogs');
    console.log('Get all blogs result:', getAllResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    console.log('Total blogs:', getAllResponse.data.length);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during API testing:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBlogAPI();
