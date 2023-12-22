module.exports = {
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    username: /^[a-zA-Z0-9._-]{4,20}$/,
    password: /^[a-zA-Z0-9._-]{4,20}$/,
    roles: /^(user|admin|moderator)$/,
    mode: /^(signup|find)$/,
    fields: /^(id|username|email|roles)$/,
    operators: /^(eq|ne|gt|gte|lt|lte|in|nin|or|and|not|nor)$/,
    extensions:
        /^(jpg|jpeg|png|mp3|wav|mp4|avi|doc|docx|pdf|zip|rar|ppt|pptx|xls|xlsx|txt|js|ts|html|css|scss|json|xml)$/,
    filenameFilter: /[\\|/]/g,
};
