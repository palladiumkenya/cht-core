function(doc) {
  if (doc.type === 'user' && doc.remote_login) {
    emit(doc.token, doc.token_expiration_date);
  }
}
