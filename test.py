for order in user.orders:
         for item in order.items:
             product = Product.query.get(item.product_id)
