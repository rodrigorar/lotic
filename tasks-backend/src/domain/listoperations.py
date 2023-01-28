

def reducer_duplicated(accumulator, current):
    if accumulator is None:
        return [current]
    elif type(accumulator) != list:
        accumulator = [accumulator]

    if current not in accumulator:
        accumulator.append(current)

    return accumulator
