function(doc) {
  if (doc.type === 'user' && doc.token_login) {
    emit(doc.token, { token_expiration_date : doc.token_expiration_date });
  }
}
