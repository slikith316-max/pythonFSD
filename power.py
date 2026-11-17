def add(a,b):
    return a+b

result = add(4,5)
print(result)           #9

def power(base, exponent):
    return base ** exponent

print(power(3, 2))  #9 (uses default)
print(power(3,3))   #27 (overrides default)
