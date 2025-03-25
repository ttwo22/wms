import Mock from 'mockjs'

// 设置模拟延迟
Mock.setup({
  timeout: '200-600'
})

// 模拟用户数据
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: '管理员',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
  },
  {
    id: 2,
    username: 'employee',
    password: 'employee123',
    role: 'employee',
    name: '仓库员工',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
  }
]

// 登录接口处理函数
export const login = (options) => {
  console.log('Mock login called:', options)
  const { username, password } = JSON.parse(options.body)
  const user = users.find(u => u.username === username && u.password === password)

  if (user) {
    // 登录成功时，将用户角色存储到localStorage
    localStorage.setItem('userRole', user.role)
    
    return {
      code: 200,
      data: {
        token: 'mock-token-' + user.id,
        userInfo: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      },
      message: '登录成功'
    }
  }

  return {
    code: 401,
    message: '用户名或密码错误'
  }
}

// 获取用户信息接口处理函数
export const getUserInfo = () => {
  console.log('Mock getUserInfo called')
  const token = localStorage.getItem('token')
  if (!token) {
    return {
      code: 401,
      message: '未登录'
    }
  }

  const userId = token.split('-')[2]
  const user = users.find(u => u.id === parseInt(userId))

  if (user) {
    return {
      code: 200,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      },
      message: '获取成功'
    }
  }

  return {
    code: 401,
    message: '用户不存在'
  }
}

// 退出登录接口处理函数
export const logout = () => {
  console.log('Mock logout called')
  // 清除localStorage中的用户角色
  localStorage.removeItem('userRole')
  return {
    code: 200,
    message: '退出成功'
  }
}

// 注册Mock接口
Mock.mock('/api/auth/login', 'post', login)
Mock.mock('/api/user/info', 'get', getUserInfo)
Mock.mock('/api/auth/logout', 'post', logout) 